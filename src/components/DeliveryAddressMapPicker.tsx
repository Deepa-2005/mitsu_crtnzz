import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  APILoadingStatus,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useApiIsLoaded,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { DeliveryLocation } from '../types';

const INDIA_OVERVIEW_CENTER = { lat: 22.5, lng: 79.0 };

function dispatchQuotaExceededIfNeeded(err: unknown) {
  const msg = String(
    err instanceof Error ? err.message : typeof err === 'object' ? JSON.stringify(err) : err
  );
  if (
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('QuotaExceeded') ||
    msg.includes('429')
  ) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
}

function useAdvancedMarkerRef() {
  const [marker, setMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const refCallback = useCallback((m: google.maps.marker.AdvancedMarkerElement | null) => {
    setMarker(m);
  }, []);
  return [refCallback, marker] as const;
}

function MapPanController({ location }: { location: DeliveryLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (location) {
      map.panTo({ lat: location.lat, lng: location.lng });
      map.setZoom(15);
    } else {
      map.panTo(INDIA_OVERVIEW_CENTER);
      map.setZoom(4);
    }
  }, [map, location]);

  return null;
}

interface DeliveryAddressMapPickerProps {
  selectedLocation: DeliveryLocation | null;
  onSelectLocation: (location: DeliveryLocation | null) => void;
  alwaysShowMap?: boolean;
  mapHeightClassName?: string;
  placeholder?: string;
}

export const DeliveryAddressMapPicker: React.FC<DeliveryAddressMapPickerProps> = ({
  selectedLocation,
  onSelectLocation,
  alwaysShowMap = false,
  mapHeightClassName = 'h-48',
  placeholder = 'Search your street, area, or city on Google Maps...',
}) => {
  const placesLib = useMapsLibrary('places');
  const isApiLoaded = useApiIsLoaded();
  const apiStatus = useApiLoadingStatus();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [infoOpen, setInfoOpen] = useState(true);

  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const resetSession = useCallback(() => {
    sessionTokenRef.current = null;
    setSuggestions([]);
  }, []);

  useEffect(() => {
    if (apiStatus === APILoadingStatus.AUTH_FAILURE) {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    }
  }, [apiStatus]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!placesLib || !isApiLoaded || trimmed.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setIsSearching(true);
        setSearchError(null);
        const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }
        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmed,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: ['in'],
        });
        setSuggestions(response?.suggestions ?? []);
        setShowDropdown(true);
      } catch (err) {
        dispatchQuotaExceededIfNeeded(err);
        setSearchError('Unable to fetch address suggestions right now. You can type your address manually.');
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [placesLib, isApiLoaded, query]);

  const handleSelectSuggestion = async (
    suggestion: google.maps.places.AutocompleteSuggestion
  ) => {
    if (!suggestion.placePrediction) return;
    try {
      setIsSearching(true);
      setSearchError(null);
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location', 'id'],
      });

      const loc = place.location;
      if (loc) {
        const picked: DeliveryLocation = {
          formattedAddress:
            place.formattedAddress || suggestion.placePrediction.text.text || query,
          lat: loc.lat(),
          lng: loc.lng(),
          placeId: place.id || undefined,
          displayName: place.displayName || undefined,
        };
        onSelectLocation(picked);
        setInfoOpen(true);
      }
      setQuery('');
      setShowDropdown(false);
      resetSession();
    } catch (err) {
      dispatchQuotaExceededIfNeeded(err);
      setSearchError('Could not load location details. Please type your full address below.');
    } finally {
      setIsSearching(false);
    }
  };

  if (apiStatus === APILoadingStatus.FAILED || apiStatus === APILoadingStatus.AUTH_FAILURE) {
    return null;
  }

  return (
    <div className="space-y-2.5">
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#183923]/55 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowDropdown(true);
            }}
            placeholder={placeholder}
            aria-label="Search delivery location with Google Maps"
            className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#FDF9F4] border border-[#A8B18F]/60 text-[13px] text-[#183923] placeholder:text-[#183923]/45 focus:outline-none focus:border-[#CF6C87]"
          />
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-[#7C6536] animate-spin absolute right-3" />
          ) : (
            query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setSuggestions([]);
                  setShowDropdown(false);
                }}
                aria-label="Clear search"
                className="absolute right-3 text-[#183923]/55 hover:text-[#183923] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )
          )}
        </div>

        {showDropdown && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute z-30 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-[#FDF9F4] border border-[#A8B18F] shadow-lg divide-y divide-[#A8B18F]/25"
          >
            {suggestions.map((suggestion, index) => {
              const label = suggestion.placePrediction?.text?.text;
              if (!label) return null;
              return (
                <li key={`${suggestion.placePrediction?.placeId || index}`}>
                  <button
                    type="button"
                    onClick={() => void handleSelectSuggestion(suggestion)}
                    className="w-full text-left px-3.5 py-2.5 text-[12.5px] text-[#183923] hover:bg-[#EFE4D3] transition-colors flex items-start gap-2 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-[#CF6C87] shrink-0 mt-0.5" />
                    <span>{label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {searchError && (
        <p className="text-[11.5px] text-[#7C6536]">{searchError}</p>
      )}

      {selectedLocation && (
        <div className="flex items-start justify-between gap-2 px-3 py-2 rounded-xl bg-[#EFE4D3]/80 border border-[#A8B18F]/50 text-[12px] text-[#183923]">
          <div className="flex items-start gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#2F7A56] shrink-0 mt-0.5" />
            <span className="truncate">{selectedLocation.formattedAddress}</span>
          </div>
          <button
            type="button"
            onClick={() => onSelectLocation(null)}
            className="text-[11px] text-[#183923]/65 hover:text-[#CF6C87] shrink-0 underline cursor-pointer"
          >
            Clear pin
          </button>
        </div>
      )}

      {(alwaysShowMap || selectedLocation) && isApiLoaded && (
        <div
          className={`w-full ${mapHeightClassName} rounded-2xl overflow-hidden border border-[#A8B18F]/60 bg-[#EFE4D3]`}
        >
          <GoogleMap
            mapId="DEMO_MAP_ID"
            defaultCenter={
              selectedLocation
                ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
                : INDIA_OVERVIEW_CENTER
            }
            defaultZoom={selectedLocation ? 15 : 4}
            gestureHandling="cooperative"
            disableDefaultUI={false}
            streetViewControl={false}
            mapTypeControl={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            <MapPanController location={selectedLocation} />
            {selectedLocation && (
              <>
                <AdvancedMarker
                  ref={markerRef}
                  position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
                  onClick={() => setInfoOpen((prev) => !prev)}
                  title={selectedLocation.displayName || 'Delivery location'}
                >
                  <Pin background="#183923" borderColor="#B69A64" glyphColor="#F8F0E4" />
                </AdvancedMarker>
                {infoOpen && marker && (
                  <InfoWindow anchor={marker} onCloseClick={() => setInfoOpen(false)}>
                    <div className="text-[12px] text-[#183923] max-w-[200px]">
                      {selectedLocation.displayName && (
                        <p className="font-semibold mb-0.5">{selectedLocation.displayName}</p>
                      )}
                      <p className="text-[#183923]/80 leading-snug">
                        {selectedLocation.formattedAddress}
                      </p>
                    </div>
                  </InfoWindow>
                )}
              </>
            )}
          </GoogleMap>
        </div>
      )}
    </div>
  );
};
