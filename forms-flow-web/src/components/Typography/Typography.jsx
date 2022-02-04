import React from "react";
import { TypographyStyle } from 'react-typography';
import typography from '@button-inc/bcgov-theme/typography';
import '@bcgov/bc-sans/css/BCSans.css';

export default React.memo(() => <TypographyStyle typography={typography} />);