import React from 'react'
import Nav from '../features/shared/Components/Nav'
import { Outlet } from 'react-router'

const AppLayout = () => {
    return (
        <>
            <Nav />
            <Outlet />
        </>
    )
}

export default AppLayout