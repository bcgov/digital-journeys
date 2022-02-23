import React from "react";
import { TypographyStyle } from 'react-typography';
import typography from '@button-inc/bcgov-theme/typography';
import '@bcgov/bc-sans/css/BCSans.css';

// Adding BC fonts
typography.options.bodyFontFamily = ['BCSans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif'];
typography.options.headerFontFamily = ['BCSans', 'Noto Sans', 'Verdana', 'Arial', 'sans-serif'];

export default React.memo(() => <TypographyStyle typography={typography} />);