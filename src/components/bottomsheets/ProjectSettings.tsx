import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootStateType } from '@Type/store';
import P from '@Component/ui/text';
import Button from '@Component/ui/button';
import { closeBottomSheet } from '@Store/reducers/app.reducer';

const ProjectSettings = () => {
  const { project } = useSelector((state: RootStateType) => state.project);
  const dispatch = useDispatch();

  return (!project ? null :
   <>
     <P size={15}>{ project.title }</P>
     <Button textSize={15} onPress={() => dispatch(closeBottomSheet())}>Fermer</Button>
   </>
  );
}

export default ProjectSettings;
