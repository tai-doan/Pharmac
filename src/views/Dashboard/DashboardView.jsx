import React from "react";
import style from "./Dashboard.module.css";
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import T from 'prop-types';

import i18next from '../../i18n';

const DashboardView = (props) => {
    const { t } = useTranslation();

    return (
        <>
           Dashboard
        </>
    )
}

export default DashboardView;
