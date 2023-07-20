import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Radio,
  Row,
  Space,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { Icon } from "@iconify/react";
import styled from "styled-components";
import { RootState } from "../features/store";
import { firestore } from "../firebase/config";
import { TicketData } from "../features/ticketSlice";
import {
  setTickets,
  setShowOverlay,
  setFilterValue,
  setDefaultValue,
} from "../features/ticketSlice";
import { setCurrentPage } from "../features/ticketPackSlice";
import { useCallback } from "react";
import { CheckboxValueType } from "antd/es/checkbox/Group";
import Navbar from "../components/navbar";
import SearchNotificationBar from "../components/search";

const StyledTicket = styled.div`
  background-color: #f9f6f4;
`;
type TablePaginationPosition =
  | "topLeft"
  | "topCenter"
  | "topRight"
  | "bottomLeft"
  | "bottomCenter"
  | "bottomRight";
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

const customColors = ["var(--yellow-05, #FFD2A8)"];

const TableWithPagination: React.FC = () => {
  const [displayMode, setDisplayMode] = useState<"GD" | "SK">("GD");

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
    },
    {
      title: "Booking Code",
      dataIndex: "bookingCode",
      className: "no-wrap",
      key: "bookingCode",
      render: (
        text:
          | string
          | number
          | boolean
          | React.ReactElement<any, string | React.JSXElementConstructor<any>>
          | Iterable<React.ReactNode>
          | React.ReactPortal
          | null
          | undefined
      ) => <a>{text}</a>,
    },
    {
      title: "Số vé",
      dataIndex: "ticketNumber",
      key: "ticketNumber",
    },
    {
      title: "Tên sự kiện",
      dataIndex: "nameEvent",
      key: "nameEvent",
      className: "no-wrap",
    },

    {
      title: "Tình trạng sử dụng",
      dataIndex: "usageStatus",
      key: "usageStatus",
      className: "no-wrap",
      render: (
        status:
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
            status === "Đã sử dụng"
              ? "used"
              : status === "Chưa sử dụng"
              ? "not-used"
              : status === "Hết hạn"
              ? "expired"
              : ""
          }
        >
          <Icon icon="ion:ellipse" style={{ marginRight: "8px" }} />
          {status}
        </span>
      ),
    },
    {
      title: "Ngày sử dụng",
      dataIndex: "usageDate",
      key: "usageDate",
    },
    {
      title: "Ngày xuất vé",
      dataIndex: "ticketDate",
      key: "ticketDate",
    },
    {
      title: "Cổng check-in",
      dataIndex: "checkInGate",
      key: "checkInGate",
      render: (gate: any) => (gate ? gate : <span>-</span>),
    },

    {
      title: "",
      key: "actions",
      render: (text: any, ticket: TicketData) => (
        <td className="icon-cell">
          {ticket.usageStatus === "Chưa sử dụng" && !ticket.checkInGate ? (
            <Space wrap>
              {customColors.map((color) => (
                <Tooltip
                  placement="left"
                  title={
                    <div className="tooltip-content">
                      <Button className="tooltip-button">Sử dụng vé</Button>
                      <Button className="tooltip-button">
                        Đổi ngày sử dụng
                      </Button>
                    </div>
                  }
                  color={color}
                  key={color}
                >
                  <Icon icon="nimbus:ellipsis" />
                </Tooltip>
              ))}
            </Space>
          ) : ticket.usageStatus === "Đã sử dụng" ||
            ticket.usageStatus === "Hết hạn" ? (
            ""
          ) : (
            ticket.checkInGate
          )}
        </td>
      ),
    },
  ];

  const currentPage = useSelector(
    (state: RootState) => state.ticketPack.currentPage
  );
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

  const [filteredTickets, setFilteredTickets] = useState([] as TicketData[]);
  const [selectedGates, setSelectedGates] = useState<string[]>([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const rowsPerPage = 4;
  const startIndex: number = (currentPage - 1) * rowsPerPage;

  const calculateIndex = (index: number): number => startIndex + index + 1;

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

  const handleDisplayModeChange = (mode: "GD" | "SK") => {
    setIsFiltered(false);
    setFilteredTickets([]); // Reset lại state filteredTickets
    dispatch(setCurrentPage(1)); // Reset lại trang hiện tại về trang đầu tiên
    dispatch(setFilterValue(["tatcacong"])); // Reset lại giá trị lọc về "Tất cả"
    dispatch(setDefaultValue("tatca")); // Reset lại giá trị mặc định về "Tất cả"
    setDisplayMode(mode);
  };

  const onChange = (date: any, dateString: string) => {
    console.log(date, dateString);
  };

  const handleCheckAllChange = (e: any) => {
    const checked = e.target.checked;
    const allGates = ["tatcacong", "cong1", "cong2", "cong3", "cong4", "cong5"];
    setSelectedGates(checked ? allGates : []);
    dispatch(setFilterValue(checked ? ["tatcacong"] : []));
  };

  const handleCheckboxChange = (checkedValues: CheckboxValueType[]) => {
    console.log("Đã chọn các giá trị:", checkedValues);
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
        // Lọc theo ticketType
        if (
          (displayMode === "GD" && ticket.ticketType !== "GD") ||
          (displayMode === "SK" && ticket.ticketType !== "SK")
        ) {
          return false;
        }

        // Lọc theo trạng thái sử dụng
        if (defaultValue === "tatca") {
          return true;
        } else if (defaultValue === "dasd") {
          return ticket.usageStatus === "Đã sử dụng";
        } else if (defaultValue === "chuasd") {
          return ticket.usageStatus === "Chưa sử dụng";
        } else if (defaultValue === "hethan") {
          return ticket.usageStatus === "Hết hạn";
        }

        // Lọc theo cổng check-in
        if (filterValue.includes("tatcacong")) {
          // Nếu đã chọn "Tất cả" thì hiển thị tất cả
          return true;
        } else if (filterValue.includes(ticket.checkInGate)) {
          // Nếu cổng check-in của vé được chọn thì hiển thị vé đó
          return true;
        }

        return false;
      });
    },
    [displayMode]
  );

  // Hàm xử lý sự kiện khi người dùng nhấp vào nút "Lọc"
  const handleFilterClick = () => {
    const filteredTickets = filterTickets(tickets, filterValue, defaultValue);
    setFilteredTickets(filteredTickets); // Cập nhật state filteredTickets sau khi lọc dữ liệu
    setIsFiltered(true);
    dispatch(setShowOverlay(false));
  };

  const handleFilterButtonClick = () => {
    dispatch(setShowOverlay(true));
  };

  const options = ["Show", "Hide", "Center"];
  const [arrow, setArrow] = useState("Show");

  const mergedArrow = useMemo(() => {
    // Your mergedArrow function code here
  }, [arrow]);

  const dataSource = useMemo(() => {
    // Lọc và tạo mảng mới chứa các vé tương ứng với `ticketType`
    const filteredTickets = tickets.filter((ticket) =>
      displayMode === "GD"
        ? ticket.ticketType === "GD"
        : ticket.ticketType === "SK"
    );

    // Kết hợp dữ liệu từ mảng filteredTickets với các thuộc tính cần thiết cho bảng
    return filteredTickets.map((ticket, index) => ({
      ...ticket,
      index: calculateIndex(index),
    }));
  }, [tickets, displayMode]);

  const [bottom] = useState<TablePaginationPosition>("bottomCenter");
  const filteredColumns =
    displayMode === "GD"
      ? columns.filter((column) => column.key !== "nameEvent")
      : columns;

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
              {/* The table component goes here */}
              <div className="ticket-table">
                <Table
                  columns={filteredColumns}
                  dataSource={isFiltered ? filteredTickets : dataSource}
                  pagination={{
                    position: [bottom],
                    current: currentPage,
                    pageSize: rowsPerPage,
                    total: tickets.length,
                    onChange: handlePageChange,
                    className: "custom-pagination",
                  }}
                />
              </div>
              {/* End of table component */}
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

export default TableWithPagination;
