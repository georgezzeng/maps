import React, { useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  useMediaQuery,
  Slide,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import useTheme from '@mui/material/styles/useTheme';
import GrafanaPanels from './GrafanaPanels';
import { Project } from '../types/mapTypes';

type SidebarProps = {
  onClose: () => void;
  header: string;
  facultyName: string;
  projects: any[];
  dataState?: boolean;
  selectedMarker: string | null;
};

const Sidebar: React.FC<SidebarProps> = ({
  onClose,
  header,
  projects,
  selectedMarker,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    setSelectedProject(null);
  }, [selectedMarker]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };
  const handleBackClick = () => {
    setSelectedProject(null);
  };

  return (
    <Slide direction='right' in={true} mountOnEnter unmountOnExit>
      <Box
        component='aside'
        sx={{
          width: isSmallScreen ? '100%' : '40%',
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100vh',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          zIndex: 10,
          padding: 2,
        }}
      >
        {selectedProject ? (
          <>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
              mb={2}
            >
              <IconButton onClick={handleBackClick} aria-label='back'>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant='h6'>{selectedProject.Name}</Typography>
              <IconButton
                onClick={onClose}
                edge='end'
                aria-label='close sidebar'
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <GrafanaPanels project={selectedProject} />
          </>
        ) : (
          <>
            <Box
              display='flex'
              justifyContent='space-between'
              alignItems='center'
              mb={2}
            >
              <Typography variant='h6'>{header}</Typography>
              <IconButton
                onClick={onClose}
                edge='end'
                aria-label='close sidebar'
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <TableContainer component={Paper}>
              <Typography variant='h5' sx={{ margin: '1rem' }}>
                Projects
              </Typography>
              <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell align='right'>Department</TableCell>
                    <TableCell align='right'>Field Of Science</TableCell>
                    <TableCell align='right'>PI Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component='th' scope='row'>
                        <Typography
                          sx={{ cursor: 'pointer', color: 'blue' }}
                          onClick={() => handleProjectClick(project)}
                        >
                          {project.Name}
                        </Typography>
                      </TableCell>
                      <TableCell align='right'>{project.Department}</TableCell>
                      <TableCell align='right'>
                        {project.FieldOfScience}
                      </TableCell>
                      <TableCell align='right'>{project.PIName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>
    </Slide>
  );
};

export default Sidebar;