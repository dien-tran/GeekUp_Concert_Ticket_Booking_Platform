package com.example.concert_booking.mapper;

import com.example.concert_booking.dto.request.VoucherRequest;
import com.example.concert_booking.dto.response.VoucherResponse;
import com.example.concert_booking.entity.Voucher;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface VoucherMapper {
    @Mapping(target = "totalQuantity", source = "usageLimit")
    @Mapping(target = "status", source = "status")
    Voucher toVoucher(VoucherRequest request);

    @Mapping(target = "usedCount", source = "usedQuantity")
    @Mapping(target = "usageLimit", source = "totalQuantity")
    @Mapping(target = "concertId", source = "concert.id")
    VoucherResponse toVoucherResponse(Voucher voucher);

    List<VoucherResponse> toVoucherResponseList(List<Voucher> vouchers);
}
