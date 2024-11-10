import React, { useState, useEffect, useMemo } from 'react';
import { Marker } from 'react-map-gl';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Tooltip } from '@mui/material';
import { getFacilityEsData } from '@/data/eqInstitutions';
import Sidebar from './Sidebar';
import { useRouter, useSearchParams } from 'next/navigation';

type MarkersProps = {
    mapRef: React.RefObject<any>;
};

const MarkersComponent: React.FC<MarkersProps> = ({ mapRef }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const faculty = searchParams.get('faculty');
    const [esData, setEsData] = useState<any>({});
    const [markerSize, setMarkerSize] = useState<any>('small');
    const [selectedMarker, setSelectedMarker] = useState<any | null>(null);
    const [facultyName, setFacultyName] = useState<string>('');
    const [facilityInstitutionData, setFacilityInstitutionData] = useState<any[]>([]);

    useEffect(() => {
        // Fetch data from ElasticSearch and both APIs
        const fetchData = async () => {
            try {
                const esData = await getFacilityEsData();
                setEsData(esData);

                const institutionsResponse = await fetch('https://topology-institutions.osg-htc.org/api/institution_ids');
                const institutionsData = await institutionsResponse.json();

                const facilityResponse = await fetch('https://topology.opensciencegrid.org/miscfacility/json');
                const facilitiesData = await facilityResponse.json();

                // Create a mapping of institution data by institutionId
                const institutionMap = institutionsData.reduce((acc, institution) => {
                    const id = institution.id;
                    acc[id] = { ...institution, facilities: [] }; // Initialize each institution with an empty facilities array
                    return acc;
                }, {});

                // Combine facility data under corresponding institutions
                Object.entries(facilitiesData).forEach(([facilityName, facilityInfo]) => {
                    const institutionId = facilityInfo.InstitutionID;
                    if (institutionMap[institutionId]) {
                        // Push facility data into the corresponding institution's facilities array
                        institutionMap[institutionId].facilities.push({
                            name: facilityName,
                            ID: facilityInfo.ID,
                            isCCStar: facilityInfo.IsCCStar,
                            esData: esData[facilityName] || null // Attach esData if available
                        });
                    }
                });

                // convert to an array
                const combinedData = Object.values(institutionMap);
                setFacilityInstitutionData(combinedData);
                console.log(combinedData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current.getMap();
        const currentZoom = map.getZoom();
        const newSize = currentZoom < 3 ? 'small' : 'large';
        if (markerSize !== newSize) {
            setMarkerSize(newSize);
        }
    }, [mapRef, markerSize]);

    // Set selected marker based on the faculty query parameter on mount
    useEffect(() => {
        if (faculty && facilityInstitutionData.length > 0) {
            const decodedFaculty = decodeURIComponent(faculty);
            const matchedFacility = facilityInstitutionData.flatMap(inst => inst.facilities).find(
                facility => facility.name === decodedFaculty
            );
            if (matchedFacility) {
                const parentInstitution = facilityInstitutionData.find(inst => inst.facilities.includes(matchedFacility));
                if (parentInstitution) {
                    setSelectedMarker(parentInstitution);
                    setFacultyName(decodedFaculty);
                    centerToMarker(parentInstitution);
                }
            }
        }
    }, [faculty, facilityInstitutionData]);

    const handleResetNorth = () => {
        const map = mapRef.current.getMap();
        map.flyTo({
            zoom: 4.5,
            duration: 2000,
        });
    };

    const convertName = (facilityName: string) => {
        const convertedName = encodeURIComponent(facilityName);
        setFacultyName(convertedName);
        return convertedName;
    };

    const closeSidebar = () => {
        window.history.pushState(null, '', `/maps`);
        setSelectedMarker(null);
        handleResetNorth();
    };

    const centerToMarker = (institution: any) => {
        const map = mapRef.current.getMap();
        map.flyTo({
            center: [institution.longitude, institution.latitude],
            zoom: 8,
            duration: 2000,
        });
    };

    const markers = useMemo(() => {
        const handleMarkerClick = (institution: any, facilityName: any) => {
            setSelectedMarker(institution);
            const convertedName = convertName(facilityName);
            centerToMarker(institution);
            window.history.pushState(null, '', `/maps/institutions?faculty=${convertedName}`);
        };

        const renderedMarkers = facilityInstitutionData.flatMap(institution =>
            institution.facilities.map(facility => {
                const esData = facility.esData;
                if (!esData) {
                    return null;
                }

                return (
                    <Marker
                        key={`${institution.id}-${facility.ID}`}
                        longitude={institution.longitude}
                        latitude={institution.latitude}
                    >
                        <Tooltip
                            title={institution.name}
                            placement="top"
                        >
                            <LocationOnIcon
                                color="primary"
                                className="hover:scale-150 transition duration-300 ease-in-out cursor-pointer"
                                fontSize={markerSize}
                                onClick={() => handleMarkerClick(institution, facility.name)}
                            />
                        </Tooltip>
                    </Marker>
                );
            })
        ).filter(marker => marker !== null);

        return renderedMarkers;
    }, [esData, markerSize, facilityInstitutionData, mapRef]);

    return (
        <>
            {markers}
            {selectedMarker && (
                <Sidebar
                    facultyName={facultyName}
                    onClose={closeSidebar}
                    header={selectedMarker.name}
                    dataState={selectedMarker.dataState}
                />
            )}
        </>
    );
};

export default MarkersComponent;
