'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { Marker } from 'react-map-gl';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Badge, Tooltip, BadgeProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import esProjects from '../../data/esProjects';
import Sidebar from './Sidebar';
import { useSearchParams } from 'next/navigation';
import SearchBar from "@/app/components/SearchBar";
// @ts-ignore
import { Institution, Project, ProjectWithESData, InstitutionWithProjects} from '@/types/mapTypes';
import DataCard from '@/app/components/DataCard';
import useSWR from 'swr';

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
    '& .MuiBadge-badge': {
        right: 0,
        top: 5,
        padding: '0 4px',
        backgroundColor: 'black',
        color: 'white',
    },
}));

const MarkersComponent: React.FC<{
    institutions: Institution[],
    projects: Project[],
    esProjects: any[],
    mapRef: any,
    institutionsWithProjects: InstitutionWithProjects[],
    filteredProjects: Project[]
}> = ({ institutions, projects, esProjects, mapRef, institutionsWithProjects, filteredProjects}) => {

    const searchParams = useSearchParams()
    const faculty = searchParams.get('faculty');
    const [markerSize, setMarkerSize] = useState<'small' | 'large'>('small');
    const [selectedMarker, setSelectedMarker] = useState<InstitutionWithProjects | null>(null);
    const [facultyName, setFacultyName] = useState<string>('');
    const [currentZoom, setCurrentZoom] = useState<number>(0);



    useEffect(() => {
        if (!mapRef.current) return;

        const map = mapRef.current.getMap();
        const handleZoom = () => {
            const zoom = map.getZoom();
            setCurrentZoom(zoom); // Update zoom level state
            const newSize = zoom < 3 ? 'small' : 'large';
            if (markerSize !== newSize) {
                setMarkerSize(newSize);
            }
        };

        handleZoom();

        map.on('zoom', handleZoom);

        return () => {
            map.off('zoom', handleZoom);
        };
    }, [markerSize]);

    useEffect(() => {
        const handleUrlChange = () => {
            const currentPath = window.location.pathname;
            if (currentPath === '/maps/institutions' || currentPath === '/maps/projects') {
                handleResetNorth();
            }
        };

        handleUrlChange();

        window.addEventListener('popstate', handleUrlChange);

        return () => {
            window.removeEventListener('popstate', handleUrlChange);
        };
    }, []);



    // console.log('institutionsWithProjects', institutionsWithProjects);

    // Set selected marker based on the faculty query parameter on mount
    useEffect(() => {
        if (faculty && institutionsWithProjects.length > 0) {
            const decodedFaculty = decodeURIComponent(faculty); // Decode the faculty name

            const matchedInstitution = institutionsWithProjects.find(
                (iwp) => iwp.name === decodedFaculty
            );

            if (matchedInstitution) {
                setSelectedMarker(matchedInstitution);
                setFacultyName(decodedFaculty);
                centerToMarker(matchedInstitution);
            }
        }
    }, [faculty, institutionsWithProjects]);

    const handleResetNorth = () => {
        const map = mapRef.current.getMap();
        map.flyTo({
            zoom: 4.5,
            duration: 2000,
        });
    };

    const convertName = (institutionName: string) => {
        const convertedName = encodeURIComponent(institutionName);
        setFacultyName(convertedName);
        return convertedName;
    };

    const closeSidebar = () => {
        window.history.pushState(null, '', `/maps`);
        setSelectedMarker(null);
        handleResetNorth();
    };

    const centerToMarker = (institution: Institution) => {
        const map = mapRef.current.getMap();
        map.flyTo({
            center: [institution.longitude, institution.latitude],
            zoom: 8,
            duration: 2000,
        });
    };

    const handleSelectInstitution = (institution: Institution) => {
        setSelectedMarker(institution);
        // console.log('slected marker', selectedMarker);
        centerToMarker(institution);
        const convertedName = convertName(institution.name);
        window.history.pushState(null, '', `/maps/institutions?faculty=${convertedName}`);
    };

    const markers = useMemo(() => {
        const handleMarkerClick = (institution: InstitutionWithProjects) => {
            setSelectedMarker(institution);
            const convertedName = convertName(institution.name);
            centerToMarker(institution);
            window.history.pushState(null, '', `/maps/projects?faculty=${convertedName}`);
        };

        return institutionsWithProjects.map((institution) => (

            <Marker
                key={institution.id}
                longitude={institution.longitude}
                latitude={institution.latitude}
            >
                {currentZoom >= 3 && (
                  <StyledBadge badgeContent={institution.projects.length} style={{ color: 'blue' }}>
                      <Tooltip title={institution.name} placement="top">
                          <LocationOnIcon
                            color="primary"
                            className="hover:scale-150 transition duration-300 ease-in-out cursor-pointer"
                            fontSize={markerSize}
                            onClick={() => handleMarkerClick(institution)}
                            style={{ color: "darkorange", cursor: "pointer"}}
                          />
                      </Tooltip>
                  </StyledBadge>
                )}
                {currentZoom < 3 && (
                  <Tooltip title={institution.name} placement="top">
                      <LocationOnIcon
                        color="primary"
                        className="hover:scale-150 transition duration-300 ease-in-out cursor-pointer"
                        fontSize={markerSize}
                        onClick={() => handleMarkerClick(institution)}
                        style={{ color: "darkorange", cursor: "pointer"}}
                      />
                  </Tooltip>
                )}

            </Marker>

        ));
    }, [institutionsWithProjects, markerSize, mapRef]);

    return (
        <>
            <SearchBar institutions={institutionsWithProjects}
                       onSelectInstitution={handleSelectInstitution}
                       shifted={Boolean(selectedMarker)}
            />
            <DataCard numberOfInstitutions={institutionsWithProjects.length} shifted={Boolean(selectedMarker)} numberOfProjects={filteredProjects.length}/>
            {markers}
            {selectedMarker && (
                <Sidebar
                    facultyName={facultyName}
                    onClose={closeSidebar}
                    header={selectedMarker.name}
                    projects={selectedMarker.projects}
                    dataState={selectedMarker}
                    selectedMarker={selectedMarker}
                    website={selectedMarker.ipeds_metadata?.website_address}
                />
            )}
        </>
    );
};

export default MarkersComponent;
