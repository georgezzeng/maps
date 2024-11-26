
import Head from 'next/head';
import Box from '@mui/material/Box';
import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useMemo } from 'react';
// @ts-ignore
import { Institution, Project} from '@/types/mapTypes';
import esProjects from '@/data/esProjects';
import Config from './config';

const fetchElasticsearchProjects = async () => {
  const response = await esProjects();
  return response.aggregations.projects.buckets;
};

const Page= async() => {
  const institutionsResponse = await fetch('https://topology-institutions.osg-htc.org/api/institution_ids');
  const institutions: Institution[] = await institutionsResponse.json();

  const projectsResponse = await fetch('https://topology.opensciencegrid.org/miscproject/json');
  let projects: Project[] = await projectsResponse.json();

  const esProjects = await fetchElasticsearchProjects();

  // console.log(institutions)

  return (
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
                initialProjects={projects}
                initialEsProjects={esProjects}/>
      </Box>
    </>
  );
}

export default Page;
