import React, { useEffect } from 'react'
import { userProduct } from '../hooks/useProduct';
import { useSelector } from 'react-redux';

const Dashboard = () => {

    const { handleGetSellerProduct } = userProduct();
    const sellerProducts = useSelector(state => state.product.sellerProducts)

    console.log(sellerProducts);

    useEffect(() => {
        handleGetSellerProduct();
    }, [])



    return (
        <div>Dashboard</div>
    )
}

export default Dashboard