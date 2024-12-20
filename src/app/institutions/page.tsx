
import Head from 'next/head';
import Box from '@mui/material/Box';
import 'mapbox-gl/dist/mapbox-gl.css';
import React from 'react';
import { getFacilityEsData } from '@/data/eqInstitutions';
import { FacilityInfo, Institution } from '@/app/types/mapTypes';
import Config from '@/app/institutions/config';


const Page = async () => {
  const institutionsResponse = await fetch('https://topology-institutions.osg-htc.org/api/institution_ids');
  const institutions: Institution[] = await institutionsResponse.json();

  const facilityResponse = await fetch('https://topology.opensciencegrid.org/miscfacility/json');
  const facilities: Record<string, FacilityInfo> = await facilityResponse.json();

  const esData = await getFacilityEsData();

  return(
    <>
      {/*<NavigationButtons/>*/}
      <Head>
        <link
          rel='stylesheet'
          href='https://api.mapbox.com/mapbox-gl-js/v2.8.1/mapbox-gl.css'
        />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>
      <Box height={'100vh'} width={'100vw'}>
        <Config initialInstitutions={institutions}
                initialFacilities={facilities}
                initialEsData={esData}/>
      </Box>
    </>
  )
}

export default Page;
