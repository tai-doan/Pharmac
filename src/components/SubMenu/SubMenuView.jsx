import React from "react";
import style from "./SubMenu.module.css";
import { Link } from "react-router-dom";
import T from 'prop-types';
import { useTranslation } from 'react-i18next';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListIcon from '@material-ui/icons/List';

const SubMenuView = ({
    item, baseLink
}) => {
    const { t } = useTranslation();

    let key = window.location.pathname.split('/');

    let activeLink = (key.length === 4) ? (key[2] + '/' + key[3]) : key[2];

    if (item.children.length > 0) {
        return (
            <>
                <div className="w-100">
                    <h6 className="pl-3 pt-3 pr-3 d-flex align-items-center">
                        <span className="mr-2">{item.icon}</span>
                        {t(item.title)}
                    </h6>
                    <List component="nav" aria-label="main mailbox folders">
                        {
                            item.children.map((row, index) => {
                                return (
                                    <React.Fragment key={index}>
                                        <Link to={baseLink + row.link} key={row.link + index} className="text-decoration-none text-dark" >
                                            <ListItem button className={activeLink === row.link ? style.active : ''}>
                                                <ListItemIcon className={style.icon}> <ListIcon /></ListItemIcon>
                                                <ListItemText><span className={style.title}>{t(row.title)}</span></ListItemText>
                                            </ListItem>
                                        </Link>
                                    </React.Fragment>
                                )
                            })
                        }
                    </List>
                </div>
            </>
        );
    } else {
        return (<></>)
    }

};

SubMenuView.propTypes = {
    baseLink: T.string
}
export default SubMenuView;