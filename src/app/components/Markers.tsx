import React, { useMemo, useState, useEffect } from "react";
import { Marker } from "react-map-gl";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Feature, TypedFeatures } from "../../../types/mapTypes";
import Features from "../../../public/features.json";
import { getFacilityEsData } from "@/app/institutions/elasticQuery.js";
import { Tooltip } from "@mui/material";

type MarkersProps = {
  onMarkerClick: (feature: Feature) => void;
};

const Markers: React.FC<MarkersProps> = ({ onMarkerClick }) => {

  const [esData, setEsData] = useState<any>({}); // Store the ElasticSearch data in the state
  const noGeoData = [] as any; // Store the institutions that don't have geo data in the state

  useEffect(() => {
    // Fetch the ElasticSearch data when the component mounts
    const fetchData = async () => {
      const data = await getFacilityEsData();
      setEsData(data);
    };

    fetchData();
  }, []); // The empty array dependency ensures this useEffect runs once when the component mounts

  const markers = useMemo(() => {
    noGeoData.length = 0;
    return Features.features.map((feature) => {
      const institutionName = feature.properties["Institution Name"];
      const esInfo = esData[institutionName];

      if (!esInfo) {
        // Handle cases where there's no matching institution in the ElasticSearch data.
        noGeoData.push(institutionName);
        return null;
      }

      const filteredFeature: TypedFeatures = {
        type: feature.type,
        properties: {
          "Institution Name": institutionName,
        },
        geometry: {
          type: feature.geometry.type,
          coordinates: [
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[1]
          ] as [number, number]
        },
        id: feature.id,
        dataState: esInfo.gpuProvided > 0
      };
      return (
        <Marker
          key={filteredFeature.id}
          longitude={filteredFeature.geometry.coordinates[0]}
          latitude={filteredFeature.geometry.coordinates[1]}
        >
          <Tooltip title={filteredFeature.properties["Institution Name"]} placement="top">
          <LocationOnIcon 
            color="primary"
            className="hover:scale-150 transition duration-300 ease-in-out cursor-pointer"
            fontSize="large" onClick={() => onMarkerClick(filteredFeature)} />
          </Tooltip>
        </Marker>
      );
    });
  }, [onMarkerClick, esData]); // Include esData in the dependencies list to recompute markers when esData changes

  console.log(noGeoData.length + ' Institutions without geo data:', noGeoData);
  return (
    <>
      {markers}
    </>
  );
  
};

export default Markers;
