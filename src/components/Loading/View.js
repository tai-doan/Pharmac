import React from "react";

const LoadingView = () => {
    return (
        <>
            <div className="h-100 d-flex align-items-center justify-content-center bg-white">
                <img src={require('../../asset/images/loading.gif')} width="200px" alt="" />
            </div>
        </>
    );
};


export default LoadingView;
