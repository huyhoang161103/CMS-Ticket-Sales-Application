import React from "react";
import styled from "styled-components";
import Navbar from "../components/navbar";
import SearchNotificationBar from "../components/search";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const StyledHome = styled.div`
  background-color: #f9f6f4;
`;

const ChartContainer = styled.div`
  display: flex;
`;

const Home: React.FC = () => {
  // Dữ liệu biểu đồ sóng với giá trị Sales tương ứng
  const data = [
    { name: "Thứ Hai", Sales: 40 },
    { Sales: 80 },
    { name: "Thứ Ba", Sales: 100 },
    { Sales: 60 },
    { name: "Thứ Tư", Sales: 120 },
    { Sales: 90 },
    { name: "Thứ Năm", Sales: 110 },
    { Sales: 50 },
    { name: "Thứ Sáu", Sales: 40 },
    { Sales: 50 },
    { name: "Thứ Bảy", Sales: 70 },
    { Sales: 30 },
    { name: "CN", Sales: 100 },
  ];

  const dataCircleGD = [
    { name: "Đã Sử Dụng", gd: 56024, fill: "#4F75FF" },
    { name: "Chưa Sử Dụng", gd: 13568, fill: "#FF8A48" },
  ];

  const dataCircleSK = [
    { name: "Đã Sử Dụng", sk: 30256, fill: "#4F75FF" },
    { name: "Chưa Sử Dụng", sk: 28302, fill: "#FF8A48" },
  ];

  // Màu cam cho biểu đồ sóng
  const waveColor = "#FF993C";

  return (
    <StyledHome>
      <div className="app">
        <Navbar />
        <div className="container-main">
          <SearchNotificationBar />
          <div className="content">
            <div className="content-main">
              <div className="title">
                <h2 className="noo-sh-title">Thống kê</h2>
              </div>
              <div>
                <div className="col">Doanh thu</div>
                <AreaChart width={1112} height={230} data={data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Sales"
                    stroke={waveColor}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="url(#colorWave)"
                  />
                  <defs>
                    <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={waveColor} />
                      <stop offset="100%" stopColor="white" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>

                <ChartContainer>
                  <div>
                    <h5>Vé Gia Đình</h5>
                    <PieChart width={230} height={230}>
                      <Pie
                        dataKey="gd"
                        data={dataCircleGD}
                        cx={115}
                        cy={115}
                        outerRadius={90}
                        innerRadius={30}
                        labelLine={false}
                      >
                        {dataCircleGD.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>
                  <div>
                    <h5>Vé Siwk kiện</h5>
                    <PieChart width={230} height={230}>
                      <Pie
                        dataKey="sk"
                        data={dataCircleSK}
                        cx={115}
                        cy={115}
                        outerRadius={90}
                        innerRadius={30}
                        labelLine={false}
                      >
                        {dataCircleSK.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </div>
                </ChartContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledHome>
  );
};

export default Home;
