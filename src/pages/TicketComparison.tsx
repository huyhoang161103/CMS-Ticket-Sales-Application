import React, { useState } from "react";
import styled from "styled-components";
import Navbar from "../components/navbar";
import "./pages.css";
import SearchNotificationBar from "../components/search";
import { Icon } from "@iconify/react";
import { Pagination } from "antd";
import { Radio } from "antd";
import type { DatePickerProps } from "antd";
import { DatePicker, Space } from "antd";

const StyledTicketComparison = styled.div`
  background-color: #f9f6f4;
`;

const TicketComparison = () => {
  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
  };
  const [value, setValue] = useState("tatca");

  const handleChange = (e: any) => {
    setValue(e.target.value);
  };
  const handlePageChange = (page: number, pageSize?: number) => {
    // Xử lý sự kiện thay đổi trang ở đây
    console.log("Trang hiện tại:", page);
  };

  return (
    <StyledTicketComparison>
      <div className="app">
        <Navbar />
        <div className="container-main">
          <SearchNotificationBar />
          <div className="total-content">
            <div className="content-1">
              <div className="content-main-1">
                <h2 className="noo-sh-title">Đối soát vé</h2>
                <div className="search-filter">
                  <div className="search-ticket">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Tìm bằng số vé"
                    />
                    <Icon
                      icon="material-symbols:search"
                      className="search-ticket-icon"
                    />
                  </div>
                  <div className="filter-check">
                    <div>
                      <button>Chốt đối soát</button>
                    </div>
                  </div>
                </div>
                <div className="ticket-table">
                  <thead>
                    <tr className="cot">
                      <th>STT</th>
                      <th>Số vé</th>
                      <th>Ngày sử dụng</th>
                      <th className="no-wrap">Tên loại vé</th>
                      <th>Cổng Check-in</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td>ABC123</td>
                      <td>123456</td>
                      <td className="no-wrap">Đã sử dụng</td>
                      <td>Gate 1</td>
                      <td className="no-wrap">Chưa đối soát</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td>DEF456</td>
                      <td>789012</td>
                      <td className="no-wrap">Chưa sử dụng</td>
                      <td>Gate 123</td>
                      <td className="no-wrap">Chưa đối soát</td>
                    </tr>
                  </tbody>
                </div>
                <div className="pagination-container">
                  <Pagination
                    defaultCurrent={1}
                    total={50}
                    onChange={handlePageChange}
                    className="custom-pagination"
                  />
                </div>
              </div>
            </div>
            <div className="content-2">
              <div className="content-main-2">
                <h5 className="noo-sh-title-filter">Lọc vé</h5>
                <div className="filter-title-checkbox row">
                  <div className="col">
                    <p className="title-filter">Trình trạng đổi soát</p>
                  </div>
                  <div className="col">
                    <Radio.Group
                      name="radiogroup"
                      value={value}
                      onChange={handleChange}
                    >
                      <Radio value="tatca">Tất cả</Radio>
                      <Radio value="dadoisoat">Đã đối soát</Radio>
                      <Radio value="chuadoisoat">Chưa đối soát</Radio>
                    </Radio.Group>
                  </div>
                </div>
                <div className="row pt-2">
                  <div className="col">
                    {" "}
                    <p className="title-filter">Loại vé</p>
                  </div>
                  <div className="col">Vé cổng</div>
                </div>
                <div className="row pt-2">
                  <div className="col">
                    {" "}
                    <p className="title-filter">Từ ngày</p>
                  </div>
                  <div className="col">
                    <Space direction="vertical">
                      <DatePicker onChange={onChange} format="DD/MM/YYYY" />
                    </Space>
                  </div>
                </div>
                <div className="row pt-2">
                  <div className="col">
                    <p className="title-filter">Đến ngày</p>
                  </div>
                  <div className="col">
                    <Space direction="vertical">
                      <DatePicker onChange={onChange} format="DD/MM/YYYY" />
                    </Space>
                  </div>
                </div>
                <div className="filter-ticket">
                  <button>Lọc</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StyledTicketComparison>
  );
};

export default TicketComparison;
