import React from 'react'
import { useTranslation } from 'react-i18next'
import Menu from '@material-ui/core/Menu'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
// import useStyles from './Style'

const ColumnCtrView = ({ anchorEl, handleClose, columns, handleCheckChange }) => {
    const { t } = useTranslation()
    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            PaperProps={{ style: { maxHeight: 300 } }}
        >
            <List>
                {columns.map((item, index) => {
                    return (
                        <ListItem key={index} role={undefined} dense button onClick={e => {}}>
                            <ListItemText id={item.title} primary={t(item.title)} />
                            <ListItemIcon className="customMenuList">
                                <Checkbox
                                    edge="end"
                                    checked={item.show}
                                    disabled={item.disabled}
                                    onChange={() => handleCheckChange(item)}
                                    inputProps={{ 'aria-labelledby': item.title }}
                                />
                            </ListItemIcon>
                        </ListItem>
                    )
                })}
            </List>
        </Menu>
    )
}

export default ColumnCtrView

