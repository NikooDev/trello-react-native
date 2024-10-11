import React from 'react';
import { LoaderLayoutInterface } from '@Type/layout';
import Loader from '@Component/ui/loader';

const LoaderLayout: React.FC<LoaderLayoutInterface> = ({
	children,
	loading
}) => {
  return (
   <>
		 { !loading && children }

		 <Loader loading={loading}/>
   </>
  );
}

export default LoaderLayout;
