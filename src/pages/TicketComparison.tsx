import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/navbar";
import "./pages.css";
import SearchNotificationBar from "../components/search";
import { Icon } from "@iconify/react";
import { Pagination, Table } from "antd";
import { Radio } from "antd";
import type { DatePickerProps } from "antd";
import { DatePicker, Space } from "antd";
import { firestore } from "../firebase/config";
import { TicketData, setTickets } from "../features/ticketSlice";
import { useDispatch } from "react-redux";

const StyledTicketComparison = styled.div`
  background-color: #f9f6f4;
`;

const TicketComparison = () => {
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      key: "stt",
      width: 20,
    },
    {
      title: "Số vé",
      dataIndex: "ticketNumber",
      key: "ticketNumber",
    },
    {
      title: "Ngày sử dụng",
      dataIndex: "usageDate",
      key: "usageDate",
    },
    {
      title: "Tên loại vé",
      dataIndex: "ticketType",
      key: "ticketType",
      ellipsis: true,
    },
    {
      title: "Cổng Check-in",
      dataIndex: "checkInGate",
      key: "checkInGate",
    },
    {
      title: "Trạng thái đối soát",
      dataIndex: "reconciliationStatus",
      key: "reconciliationStatus",
      width: 40,
      render: (
        reconciliationStatus:
          | string
          | number
          | boolean
          | React.ReactElement<any, string | React.JSXElementConstructor<any>>
          | Iterable<React.ReactNode>
          | null
          | undefined
      ) => (
        <span
          className={
            reconciliationStatus === "Đã đối soát"
              ? "reconciliation-status-red"
              : "reconciliation-status-italic-gray"
          }
        >
          {reconciliationStatus}
        </span>
      ),
    },
  ];
  const dispatch = useDispatch();
  const [ticketData, setTicketData] = useState<TicketData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 7; // Số hàng hiển thị trên mỗi trang

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const snapshot = await firestore.collection("tickets").get();
        const ticketData = snapshot.docs.map((doc) => doc.data() as TicketData);
        dispatch(setTickets(ticketData));
        setTicketData(ticketData); // Cập nhật trạng thái ticketData với dữ liệu đã lấy
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchTickets();
  }, [dispatch]);

  const handleReconciliation = async () => {
    try {
      // Gọi API để cập nhật trạng thái trong Firestore
      const querySnapshot = await firestore
        .collection("tickets")
        .where("reconciliationStatus", "==", "Chưa đối soát")
        .get();
      const batch = firestore.batch();
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { reconciliationStatus: "Đã đối soát" });
      });
      await batch.commit();

      // Nếu không có lỗi, cập nhật lại trạng thái của React component
      const updatedTicketData = ticketData.map((ticket) => {
        if (ticket.reconciliationStatus === "Chưa đối soát") {
          return {
            ...ticket,
            reconciliationStatus: "Đã đối soát",
          };
        }
        return ticket;
      });

      setTicketData(updatedTicketData);
    } catch (error) {
      console.error("Error updating reconciliation status:", error);
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    // Xử lý sự kiện thay đổi trang ở đây
    console.log("Trang hiện tại:", page);
  };

  const onChange: DatePickerProps["onChange"] = (date, dateString) => {
    console.log(date, dateString);
  };
  const [value, setValue] = useState("tatca");

  const handleChange = (e: any) => {
    setValue(e.target.value);
  };

  // Bên trong thành phần TicketComparison
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredTicketData, setFilteredTicketData] = useState<TicketData[]>(
    []
  );

  // Bên trong thành phần TicketComparison
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);
    filterSearchResults(searchValue); // Kích hoạt tìm kiếm dựa trên giá trị nhập vào.
  };
  const filterSearchResults = (searchTerm: string) => {
    const searchResults = ticketData.filter(
      (ticket) =>
        ticket.ticketNumber.includes(searchTerm) ||
        ticket.reconciliationStatus.includes(searchTerm)
    );

    // Đánh STT cho danh sách vé sau khi tìm kiếm
    const searchResultsWithStt = searchResults.map((ticket, index) => ({
      ...ticket,
      stt: index + 1,
    }));

    // Cập nhật danh sách vé hiển thị dựa trên kết quả tìm kiếm
    setFilteredTicketData(searchResultsWithStt);
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
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                    <Icon
                      icon="material-symbols:search"
                      className="search-ticket-icon"
                    />
                  </div>
                  <div className="filter-check">
                    <div>
                      <button onClick={handleReconciliation}>
                        Chốt đối soát
                      </button>
                    </div>
                  </div>
                </div>
                <div className="ticket-table">
                  <Table
                    columns={columns}
                    dataSource={
                      searchTerm
                        ? filteredTicketData
                        : ticketData.map((ticket, index) => ({
                            ...ticket,
                            stt: index + 1,
                          }))
                    }
                    pagination={false}
                  />
                </div>
                <div className="pagination-container">
                  <Pagination
                    current={currentPage}
                    pageSize={rowsPerPage}
                    total={ticketData.length}
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
                    <p className="title-filter">Trình trạng đối soát</p>
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
