import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import {
  setFilterValue,
  setDefaultValue,
  setTickets,
  setShowOverlay,
} from "../features/ticketSlice";
import { RootState } from "../features/store";
import { firestore } from "../firebase/config";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import Navbar from "../components/navbar";
import SearchNotificationBar from "../components/search";
import { Icon } from "@iconify/react";
import { Checkbox, Col, DatePicker, Pagination, Radio, Row, Space } from "antd";
import styled from "styled-components";
import { TicketData } from "../features/ticketSlice";
import { setCurrentPage } from "../features/ticketPackSlice";
import { useCallback } from "react";

const StyledTicket = styled.div`
  background-color: #f9f6f4;
`;

const TransparentButton = styled.button`
  font-family: monospace;
  font-size: 18px;
  font-style: normal;
  font-weight: 700;
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding-bottom: 10px;
  margin-right: 12px;
`;

const Ticket: React.FC = () => {
  const currentPage = useSelector(
    (state: RootState) => state.ticketPack.currentPage
  );

  const [filteredTickets, setFilteredTickets] = useState([] as TicketData[]);

  const rowsPerPage = 6;

  const startIndex: number = (currentPage - 1) * rowsPerPage;

  const calculateIndex = (index: number): number => startIndex + index + 1;

  const filterValue = useSelector(
    (state: RootState) => state.ticket.filterValue
  );
  const defaultValue = useSelector(
    (state: RootState) => state.ticket.defaultValue
  );
  const tickets = useSelector((state: RootState) => state.ticket.tickets);
  const showOverlay = useSelector(
    (state: RootState) => state.ticket.showOverlay
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const snapshot = await firestore.collection("tickets").get();
        const ticketData = snapshot.docs.map((doc) => doc.data() as TicketData);
        dispatch(setTickets(ticketData));
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [dispatch]);

  const exportToCSV = () => {
    // Chuẩn bị dữ liệu để xuất ra file .csv
    let csvContent = "data:text/csv;charset=utf-8,";

    // Định dạng tiêu đề cột
    const headers = [
      "STT",
      "Booking Code",
      "Số vé",
      "Tên sự kiện",
      "Tình trạng sử dụng",
      "Ngày sử dụng",
      "Ngày xuất vé",
      "Cổng check-in",
    ];
    csvContent += headers.join(",") + "\n";

    // Lọc và định dạng nội dung từng dòng theo ticketType
    const filteredTickets = tickets.filter(
      (ticket) =>
        displayMode === "GD"
          ? ticket.ticketType === "GD" // Lọc vé gia đình
          : ticket.ticketType === "SK" // Lọc vé sự kiện
    );
    filteredTickets.forEach((ticket, index) => {
      const row = [
        index + 1,
        ticket.bookingCode,
        ticket.ticketNumber,
        ticket.nameEvent,
        ticket.usageStatus,
        ticket.usageDate,
        ticket.ticketDate,
        ticket.checkInGate,
      ];
      csvContent += row.join(",") + "\n";
    });

    // Tạo đối tượng URL để tải file .csv
    const encodedURI = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedURI);
    link.setAttribute("download", "tickets.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [displayMode, setDisplayMode] = useState<"GD" | "SK">("GD");

  const handleDisplayModeChange = (mode: "GD" | "SK") => {
    setDisplayMode(mode);
  };

  const onChange = (date: any, dateString: string) => {
    console.log(date, dateString);
  };

  const handleCheckAllChange = (e: any) => {
    const checked = e.target.checked;
    const values = checked ? ["tatcacong"] : [];
    dispatch(setFilterValue(values));
  };

  const handleCheckboxChange = (checkedValues: CheckboxValueType[]) => {
    dispatch(setFilterValue(checkedValues as string[]));
  };

  const handleChange = (e: any) => {
    dispatch(setDefaultValue(e.target.value));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const filterTickets = useCallback(
    (tickets: TicketData[], filterValue: string[], defaultValue: string) => {
      return tickets.filter((ticket) => {
        // Lọc theo trạng thái sử dụng
        if (defaultValue === "tatca") {
          // Chọn "Tất cả"
          return true;
        } else if (defaultValue === "dasd") {
          // Chọn "Đã sử dụng"
          return ticket.usageStatus === "Đã sử dụng";
        } else if (defaultValue === "chuasd") {
          // Chọn "Chưa sử dụng"
          return ticket.usageStatus === "Chưa sử dụng";
        } else if (defaultValue === "hethan") {
          // Chọn "Hết hạn"
          return ticket.usageStatus === "Hết hạn";
        }

        // Lọc theo cổng check-in
        if (filterValue.includes("tatcacong")) {
          // Chọn "Tất cả"
          return true;
        } else if (filterValue.includes(ticket.checkInGate)) {
          // Chọn cổng check-in cụ thể
          return true;
        }

        return false;
      });
    },
    []
  );

  // Hàm xử lý sự kiện khi người dùng nhấp vào nút "Lọc"
  const handleFilterClick = useCallback(() => {
    const filteredTickets = filterTickets(tickets, filterValue, defaultValue); // Gọi hàm filterTickets để lọc danh sách vé
    setFilteredTickets(filteredTickets); // Cập nhật danh sách vé đã lọc vào state
    dispatch(setShowOverlay(false));
  }, [tickets, filterValue, defaultValue, filterTickets]);

  useEffect(() => {
    const filteredTickets = filterTickets(tickets, filterValue, defaultValue);
    setFilteredTickets(filteredTickets);
  }, [tickets, filterValue, defaultValue, filterTickets]);

  const handleFilterButtonClick = () => {
    dispatch(setShowOverlay(true));
  };

  return (
    <StyledTicket>
      <div className="app">
        <Navbar />
        <div className="container-main">
          <SearchNotificationBar />
          <div className="content">
            <div className="content-main">
              <div className="title">
                <h2 className="noo-sh-title">Danh sách vé</h2>
              </div>
              <div className="category">
                <TransparentButton
                  style={{
                    borderBottom:
                      displayMode === "GD" ? "4px solid orange" : "none",
                  }}
                  onClick={() => handleDisplayModeChange("GD")}
                >
                  Vé gia đình
                </TransparentButton>
                <TransparentButton
                  style={{
                    borderBottom:
                      displayMode === "SK" ? "4px solid orange" : "none",
                  }}
                  onClick={() => handleDisplayModeChange("SK")}
                >
                  Vé sự kiện
                </TransparentButton>
              </div>
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
                <div className="filter">
                  <div>
                    <button onClick={handleFilterButtonClick}>
                      <Icon icon="lucide:filter" className="icon-ticket" />
                      Lọc vé
                    </button>
                    <button onClick={exportToCSV}>Xuất file (.CSV)</button>
                  </div>
                </div>
              </div>
              <div className="ticket-table">
                <thead>
                  <tr className="cot">
                    <th>STT</th>
                    <th className="no-wrap">Booking Code</th>
                    <th>Số vé</th>
                    {displayMode === "SK" && (
                      <th className="no-wrap">Tên sự kiện</th>
                    )}
                    <th>Tình trạng sử dụng</th>
                    <th>Ngày sử dụng</th>
                    <th>Ngày xuất vé</th>
                    <th>Cổng check-in</th>

                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets
                    .filter((ticket) =>
                      displayMode === "GD"
                        ? ticket.ticketType === "GD"
                        : ticket.ticketType === "SK"
                    )
                    .slice(
                      (currentPage - 1) * rowsPerPage,
                      currentPage * rowsPerPage
                    )
                    .map((ticket, index) => (
                      <tr key={index}>
                        <td>{calculateIndex(index)}</td>
                        <td>{ticket.bookingCode}</td>
                        <td>{ticket.ticketNumber}</td>
                        {displayMode === "SK" && <td>{ticket.nameEvent}</td>}

                        <td>
                          <span
                            className={
                              ticket.usageStatus === "Đã sử dụng"
                                ? "used"
                                : ticket.usageStatus === "Chưa sử dụng"
                                ? "not-used"
                                : ticket.usageStatus === "Hết hạn"
                                ? "expired"
                                : ""
                            }
                          >
                            <Icon
                              icon="ion:ellipse"
                              style={{ marginRight: "8px" }}
                            />
                            {ticket.usageStatus}
                          </span>
                        </td>
                        <td>{ticket.usageDate}</td>
                        <td>{ticket.ticketDate}</td>
                        <td>
                          {ticket.checkInGate ? (
                            ticket.checkInGate
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        <td>
                          {ticket.usageStatus === "Chưa sử dụng" &&
                          !ticket.checkInGate ? (
                            <Icon icon="nimbus:ellipsis" />
                          ) : ticket.usageStatus === "Đã sử dụng" ||
                            ticket.usageStatus === "Hết hạn" ? (
                            ""
                          ) : (
                            ticket.checkInGate
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
                <div className="pagination-container pagination-fixed">
                  <Pagination
                    current={currentPage}
                    pageSize={rowsPerPage}
                    total={tickets.length}
                    onChange={handlePageChange}
                    className="custom-pagination"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showOverlay && (
        <div className="overlay">
          <div className="overlay-content-1">
            <p>Lọc vé</p>
            <div className="overlay-filter">
              <div className="row pt-2">
                <div className="col">
                  <span>Từ ngày</span>
                </div>
                <div className="col">
                  <span>Đến ngày</span>
                </div>
              </div>
              <div className="row pt-2">
                <div className="col">
                  <Space direction="vertical">
                    <DatePicker onChange={onChange} format="DD/MM/YYYY" />
                  </Space>
                </div>
                <div className="col">
                  <Space direction="vertical">
                    <DatePicker onChange={onChange} format="DD/MM/YYYY" />
                  </Space>
                </div>
              </div>
              <div className="row pt-3">
                <span>Tình trạng sử dụng</span>
              </div>
              <div className="row pt-2">
                <Radio.Group
                  name="radiogroup"
                  value={defaultValue}
                  onChange={handleChange}
                  className="d-flex justify-content-between"
                >
                  <Radio value="tatca">Tất cả</Radio>
                  <Radio value="dasd">Đã sử dụng</Radio>
                  <Radio value="chuasd">Chưa sử dụng</Radio>
                  <Radio value="hethan">Hết hạn</Radio>
                </Radio.Group>
              </div>
              <div className="row pt-3">
                <span>Cổng check-in</span>
              </div>
              <div className="row pt-2">
                <Checkbox.Group
                  style={{ width: "100%" }}
                  value={filterValue}
                  onChange={handleCheckboxChange}
                >
                  <Row>
                    <Col span={8}>
                      <Checkbox
                        value="tatcacong"
                        onChange={handleCheckAllChange}
                        checked={filterValue.includes("tatcacong")}
                      >
                        Tất cả
                      </Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox
                        value="cong1"
                        disabled={filterValue.includes("tatcacong")}
                      >
                        Cổng 1
                      </Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox
                        value="cong2"
                        disabled={filterValue.includes("tatcacong")}
                      >
                        Cổng 2
                      </Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox
                        value="cong3"
                        disabled={filterValue.includes("tatcacong")}
                      >
                        Cổng 3
                      </Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox
                        value="cong4"
                        disabled={filterValue.includes("tatcacong")}
                      >
                        Cổng 4
                      </Checkbox>
                    </Col>
                    <Col span={8}>
                      <Checkbox
                        value="cong5"
                        disabled={filterValue.includes("tatcacong")}
                      >
                        Cổng 5
                      </Checkbox>
                    </Col>
                  </Row>
                </Checkbox.Group>
              </div>
            </div>
            <div className="filter pt-4">
              <div className="filter-ticket">
                <button onClick={handleFilterClick}>Lọc</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StyledTicket>
  );
};

export default Ticket;
