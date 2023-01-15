import React from "react";
import { Spin, ConfigProvider } from "antd";

const Loader = () => {
  return (
    <div className="loader">
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#eb2f96",
          },
        }}
      >
        <Spin size="large" tip="Loading..." />
      </ConfigProvider>
    </div>
  );
};

export default Loader;
