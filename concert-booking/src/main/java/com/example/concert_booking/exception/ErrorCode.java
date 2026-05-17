package com.example.concert_booking.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // 9xxx - System
    UNCATEGORIZED_EXCEPTION(9000, "Lỗi không xác định", HttpStatus.INTERNAL_SERVER_ERROR),

    // 10xx - Common validation and authentication
    INVALID_KEY(1001, "Khóa thông báo không hợp lệ", HttpStatus.BAD_REQUEST),
    NOT_NULL(1002, "Vui lòng điền vào tất cả các trường", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(1003, "Yêu cầu không hợp lệ", HttpStatus.BAD_REQUEST),
    PHONENUMBER_INVALID(1004, "Số điện thoại không hợp lệ", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1010, "Chưa xác thực", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1011, "Bạn không có quyền truy cập", HttpStatus.FORBIDDEN),
    INVALID_CREDENTIALS(1012, "Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),

    // 11xx - User and Role
    USER_NOT_EXISTED(1101, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    USER_EMAIL_EXISTED(1102, "Email đã được sử dụng", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1103, "Vai trò không tồn tại", HttpStatus.NOT_FOUND),
    ROLE_EXISTED(1104, "Vai trò đã tồn tại", HttpStatus.BAD_REQUEST),
    PERMISSION_NOT_EXISTED(1105, "Quyền không tồn tại", HttpStatus.NOT_FOUND),

    // 13xx - Concert
    CONCERT_NOT_FOUND(1301, "Concert không tồn tại", HttpStatus.NOT_FOUND),
    CONCERT_NOT_EXISTED(1301, "Concert không tồn tại", HttpStatus.NOT_FOUND),
    INVALID_CONCERT_STATUS(1302, "Trạng thái concert không hợp lệ", HttpStatus.BAD_REQUEST),

    // 14xx - Location and showtime
    LOCATION_NOT_EXIST(1401, "Địa điểm/Phòng không tồn tại", HttpStatus.NOT_FOUND),
    SHOWTIME_NOT_EXIST(1402, "Suất diễn không tồn tại", HttpStatus.NOT_FOUND),
    SHOWTIME_ALREADY_PASSED(1403, "Suất diễn đã diễn ra", HttpStatus.BAD_REQUEST),
    SHOWTIME_BEFORE_CONCERT_RELEASE(1404, "Suất diễn phải sau ngày mở bán của concert", HttpStatus.BAD_REQUEST),
    SHOWTIME_END_BEFORE_START(1405, "Thời gian kết thúc suất diễn phải sau thời gian bắt đầu", HttpStatus.BAD_REQUEST),
    SHOWTIME_OVERLAP(1406, "Suất diễn bị trùng", HttpStatus.BAD_REQUEST),
    SHOWTIME_HAS_BOOKINGS(1407, "Không thể xóa hoặc cập nhật suất diễn đã có đặt vé", HttpStatus.BAD_REQUEST),
    CONCERT_ENDED(1408,"Concert đã kết thúc" ,  HttpStatus.BAD_REQUEST),

    // 15xx - Ticket and hold
    TICKET_ALREADY_EXIST(1501, "Vé đã tồn tại", HttpStatus.BAD_REQUEST),
    TICKET_SHOWTIME_EXISTED(1502, "Vé đã tồn tại trong suất diễn này", HttpStatus.BAD_REQUEST),
    INVALID_TICKET_ID(1503, "Mã vé không hợp lệ", HttpStatus.BAD_REQUEST),
    INVALID_TICKET_IDS(1504, "Danh sách mã vé không hợp lệ", HttpStatus.BAD_REQUEST),
    TICKET_ALREADY_HELD(1505, "Vé đã được giữ", HttpStatus.BAD_REQUEST),
    HOLD_EXPIRED(1506, "Thời gian giữ vé đã hết hạn", HttpStatus.BAD_REQUEST),
    TICKET_NOT_AVAILABLE(1507, "Vé không khả dụng", HttpStatus.BAD_REQUEST),
    TICKET_HOLD_USER_MISMATCH(1508, "Người giữ vé không khớp", HttpStatus.BAD_REQUEST),

    // 16xx - Booking and payment
    BOOKING_NOT_FOUND(1601, "Không tìm thấy đặt vé", HttpStatus.NOT_FOUND),
    BOOKING_ALREADY_CANCELLED(1602, "Đặt vé đã bị hủy", HttpStatus.BAD_REQUEST),
    BOOKING_ALREADY_CONFIRMED(1603, "Đặt vé đã được xác nhận", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_PENDING(1604, "Đặt vé không ở trạng thái chờ", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_EXISTS(1605, "Đã tồn tại thanh toán cho đặt vé này", HttpStatus.BAD_REQUEST),
    QR_TOKEN_INVALID(1606, "QR không hợp lệ", HttpStatus.BAD_REQUEST),
    QR_TOKEN_EXPIRED(1607, "QR đã hết hạn", HttpStatus.BAD_REQUEST),
    QR_USED(1608, "QR đã được sử dụng", HttpStatus.BAD_REQUEST),
    BOOKING_INVALID_FOR_SCAN(1609, "Đặt vé không hợp lệ để quét", HttpStatus.BAD_REQUEST),
    BOOKING_NOT_CANCELLED(1610, "Đặt vé chưa được hủy", HttpStatus.BAD_REQUEST),

    // 17xx - Voucher
    VOUCHER_NOT_FOUND(1701, "Mã giảm giá không tồn tại", HttpStatus.NOT_FOUND),
    VOUCHER_OUT_OF_STOCK(1702, "Mã giảm giá đã hết lượt sử dụng", HttpStatus.BAD_REQUEST),
    VOUCHER_ALREADY_USED(1703, "Bạn đã sử dụng mã giảm giá này rồi", HttpStatus.BAD_REQUEST),
    VOUCHER_INACTIVE(1704, "Mã giảm giá chưa được kích hoạt", HttpStatus.BAD_REQUEST),
    ;



    private int code;
    private String message;
    private HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.message = message;
        this.code = code;
        this.statusCode = statusCode;
    }
}
