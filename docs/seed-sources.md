# FloodMap M1 — seed sources (v3, 2026-10-09)

Every source used for the seed spots and review-only candidates. Dates are publication dates (from the article page or its URL timestamp).
Spot IDs refer to `2026-10-09_floodmap_seed-spots_v3.geojson`; C-numbers are review-only candidates in the xlsx.

## How depth and frequency were set

- **depth_cm** = numbers from the source when given; otherwise words converted with the table below. `min` = lowest typical (often the official 10–30 or 15–30 cm range), `max` = highest well-sourced report from 2023–2026. Where `max` comes from a group figure covering several streets, or a record event, the spot is flagged.
- **frequency** = `frequent` if on an official recurring list (Sở Xây dựng), or more than one reported flood in a season (Trong, v2), or the source says it floods every heavy rain; `occasional` = reported floods in two seasons but never twice in one; otherwise unknown → candidate only.
- **ward** = checked against NQ 1685, the official 2026 lists (which use new ward names), CSGT and news reports naming the new ward, and OSM ward boundaries. Remaining doubts are in the flags.
- **status** = `active` for all spots: no source says any of them was fixed. Projects reported as finished but not effective (Nguyễn Văn Quá) stay active.

| Depth wording | English | cm |
|---|---|---|
| lấp xấp / mắt cá | ankle-deep | 5–10 |
| nửa bánh xe (máy) | half a motorbike wheel | 15–30 |
| ngập bánh xe / lút bánh xe / gần gối | wheel-deep / nearly knee | 30–40 |
| đến đầu gối | knee-deep | 40–50 |
| quá đầu gối / ngang đùi | above knee / thigh | 50–70 |

## Sources

| Key | Title | Publisher | Date | Type | Supports |
|---|---|---|---|---|---|
| S01 | [Tra cứu 159 điểm ngập thường xuyên tại TP HCM (dữ liệu Sở Xây dựng, cập nhật đến 01/2026)](https://vnexpress.net/tra-cuu-159-diem-ngap-thuong-xuyen-tai-tp-hcm-5127780.html) | VnExpress | 2026-10-05 | official list (Sở Xây dựng) via newspaper | hcm-0001, hcm-0002, hcm-0003, hcm-0004, hcm-0005, hcm-0008, hcm-0009, hcm-0010, hcm-0012, hcm-0013, hcm-0014, hcm-0015, hcm-0018, hcm-0019, hcm-0020, hcm-0021, hcm-0024, hcm-0028, C01, C02, C03, C04, C06, C08, C09, C10, C11, C14, C18, C19, C22 |
| S02 | [TP.HCM có 159 điểm ngập nước: Lưu ý loạt tuyến đường cứ mưa lớn là thành sông](https://thanhnien.vn/tphcm-co-159-diem-ngap-nuoc-luu-y-loat-tuyen-duong-cu-mua-lon-la-thanh-song-185260603132017624.htm) | Thanh Niên | 2026-06-03 | official list (Sở Xây dựng) via newspaper | — |
| S03 | [TPHCM công bố 34 tuyến đường ngập do mưa và triều cường](https://dantri.com.vn/thoi-su/tphcm-cong-bo-34-tuyen-duong-ngap-do-mua-va-trieu-cuong-20260625181340802.htm) | Dân trí | 2026-06-25 | official (Sở Xây dựng press conference) | hcm-0003, hcm-0004, hcm-0005, hcm-0008, hcm-0009, hcm-0013, hcm-0014, hcm-0015, hcm-0019, hcm-0020, hcm-0022, hcm-0024 |
| S04 | [Ho Chi Minh City lists most flood-prone streets, including one in former Thao Dien](https://news.tuoitre.vn/ho-chi-minh-city-lists-most-flood-prone-streets-including-one-in-former-thao-dien-103260626100336837.htm) | Tuổi Trẻ News | 2026-06-26 | official (Sở Xây dựng) via newspaper | hcm-0020, hcm-0022 |
| S05 | [Danh sách 23 tuyến đường bị ngập nước do triều cường ở TP.HCM](https://thanhnien.vn/danh-sach-23-tuyen-duong-bi-ngap-nuoc-do-trieu-cuong-o-tphcm-185251120195250754.htm) | Thanh Niên | 2025-11-20 | official (Sở Xây dựng press conference) | hcm-0001, hcm-0003, hcm-0004, hcm-0005, hcm-0010, hcm-0020, hcm-0022, hcm-0023 |
| S06 | [23 tuyến đường ngập do triều cường ở TP.HCM, người dân cần ghi nhớ](https://tuoitre.vn/23-tuyen-duong-ngap-do-trieu-cuong-o-tp-hcm-nguoi-dan-can-ghi-nho-20251120193639188.htm) | Tuổi Trẻ | 2025-11-20 | official (Sở Xây dựng) via newspaper | hcm-0023 |
| S07 | [9 tháng đầu năm, toàn TP.HCM có 30 tuyến đường ngập khi mưa](https://tuoitre.vn/9-thang-dau-nam-toan-tp-hcm-co-30-tuyen-duong-ngap-khi-mua-20241015175215262.htm) | Tuổi Trẻ | 2024-10-15 | official (Sở Xây dựng 2024 report) via newspaper | hcm-0001, hcm-0002, hcm-0008, hcm-0009, hcm-0010, hcm-0012, hcm-0013, hcm-0014, hcm-0015, hcm-0021, hcm-0024, hcm-0028, C01, C02, C06, C08, C09 |
| S08 | [Danh sách 122 điểm ngập do mưa lớn, triều cường tại TP.HCM](https://tuoitre.vn/danh-sach-122-diem-ngap-do-mua-lon-trieu-cuong-tai-tphcm-100261007160246997.htm) | Tuổi Trẻ | 2026-10-07 | official warning list (Phòng CSGT TP.HCM) via newspaper | hcm-0003, hcm-0004, hcm-0005, hcm-0007, hcm-0009, hcm-0011, hcm-0012, hcm-0016, hcm-0018, hcm-0020, hcm-0021, hcm-0022, hcm-0023, hcm-0025, hcm-0026, hcm-0029, hcm-0030, C04, C05, C07, C13, C14, C15, C16, C17, C18, C19, C20, C21, C22 |
| S09 | [Những điểm ngập nào ở TP.HCM được đưa vào kế hoạch giải quyết ngập năm 2026?](https://tuoitre.vn/nhung-diem-ngap-nao-o-tphcm-duoc-dua-vao-ke-hoach-giai-quyet-ngap-nam-2026-100260911182314895.htm) | Tuổi Trẻ | 2026-09-11 | official plan (UBND TP.HCM) via newspaper | hcm-0010 |
| S10 | [TP.HCM sẽ rà soát xử lý điểm ngập nào, thứ tự ưu tiên ra sao?](https://tuoitre.vn/tphcm-se-ra-soat-xu-ly-diem-ngap-nao-thu-tu-uu-tien-ra-sao-100261003170822626.htm) | Tuổi Trẻ | 2026-10-03 | official plan (UBND TP.HCM) via newspaper | hcm-0008, hcm-0010, hcm-0019, C12 |
| S11 | [Triều cường 1,82m gây ngập nhiều nơi ở TP.HCM, Sở Xây dựng nêu nguyên nhân và giải pháp ứng phó](https://tuoitre.vn/trieu-cuong-1-82m-gay-ngap-nhieu-noi-o-tp-hcm-so-xay-dung-neu-nguyen-nhan-va-giai-phap-ung-pho-20251030154940159.htm) | Tuổi Trẻ | 2025-10-30 | official (Sở Xây dựng) via newspaper | hcm-0003, hcm-0004, hcm-0005, hcm-0007, hcm-0010, hcm-0015, C21 |
| S12 | [Những tuyến đường nào ở TP.HCM hễ mưa lớn là ngập?](https://thanhnien.vn/nhung-tuyen-duong-nao-o-tphcm-he-mua-lon-la-ngap-185261004175107092.htm) | Thanh Niên | 2026-10-04 | news | hcm-0002, hcm-0012, hcm-0016, hcm-0018, hcm-0020, hcm-0021, hcm-0025, hcm-0026, hcm-0027, C09, C10 |
| S13 | [Mưa xối xả, người dân TPHCM nhích từng chút trên đường về nhà](https://dantri.com.vn/thoi-su/mua-xoi-xa-nguoi-dan-tphcm-nhich-tung-chut-tren-duong-ve-nha-20261007193731725.htm) | Dân trí | 2026-10-07 | news | hcm-0009 |
| S14 | [Đường Nguyễn Văn Khối thành sông sau mưa lớn, sóng xô ngã người đi đường](https://thanhnien.vn/duong-nguyen-van-khoi-thanh-song-sau-mua-lon-song-xo-nga-nguoi-di-duong-185261007202658218.htm) | Thanh Niên | 2026-10-07 | news | hcm-0012 |
| S15 | [Mưa lớn gây ngập sâu ở TP.HCM, xe chết máy hàng loạt](https://tuoitre.vn/mua-lon-gay-ngap-sau-o-tp-hcm-xe-chet-may-hang-loat-20251003152251329.htm) | Tuổi Trẻ | 2025-10-03 | news | hcm-0014 |
| S16 | [Đường Phan Huy Ích ngập nặng 'kỷ lục', nước tràn vào khiến xe buýt chết máy la liệt](https://tuoitre.vn/duong-phan-huy-ich-ngap-nang-ky-luc-nuoc-tran-vao-khien-xe-buyt-chet-may-la-liet-10026093021260881.htm) | Tuổi Trẻ | 2026-09-30 | news | hcm-0014 |
| S17 | [12 tuyến đường ở TPHCM ngập sau mưa lớn, có nơi ngập hơn 1 mét](https://tienphong.vn/12-tuyen-duong-o-tphcm-ngap-sau-mua-lon-co-noi-ngap-hon-1-met-post1881279.tpo) | Tiền Phong | 2026-10-01 | news (citing Trung tâm Quản lý điều hành giao thông) | hcm-0008, hcm-0012, hcm-0013, hcm-0014, hcm-0015, C09, C14, C15, C16 |
| S18 | [Cảnh báo hố sâu nguy hiểm tại con đường ngập nặng nhất ở TPHCM](https://tienphong.vn/canh-bao-ho-sau-nguy-hiem-tai-con-duong-ngap-nang-nhat-o-tphcm-post1882138.tpo) | Tiền Phong | 2026-10-04 | news | hcm-0014 |
| S19 | ['Ngốn' hơn 160 tỷ đồng, đường Nguyễn Văn Quá vẫn… thành sông](https://vovgiaothong.vn/newsaudio/ngon-hon-160-ty-dong-duong-nguyen-van-qua-van-thanh-song-d41623.html) | VOV Giao thông | 2024-11-01 | news | hcm-0008 |
| S20 | [Cận cảnh ngập, người dân đi lại chật vật trong trận mưa ngày 3-10](https://tuoitre.vn/nld/can-canh-ngap-nguoi-dan-di-lai-chat-vat-trong-tran-mua-ngay-3-10-196251003160551855.htm) | Người Lao Động | 2025-10-03 | news | hcm-0008, hcm-0013 |
| S21 | [Nhiều tuyến đường ở TPHCM lại ngập như sông, người dân bất lực nhìn nước bẩn tràn vào nhà](https://vietnamnet.vn/duong-o-tphcm-lai-ngap-nhu-song-nguoi-dan-bat-luc-nhin-nuoc-ban-tran-vao-nha-2454310.html) | VietNamNet | 2025-10-19 | news | — |
| S22 | [Mưa lớn trên 150mm từ sáng ở TPHCM, nhiều tuyến đường ngập nặng](https://dantri.com.vn/thoi-su/mua-lon-tren-150mm-tu-sang-o-tphcm-nhieu-tuyen-duong-ngap-nang-20250510075728453.htm) | Dân trí | 2025-05-10 | news | hcm-0011, hcm-0013 |
| S23 | [TPHCM ngập như miền Tây mùa nước nổi trong ngày triều cường đạt đỉnh](https://dantri.com.vn/thoi-su/tphcm-ngap-nhu-mien-tay-mua-nuoc-noi-trong-ngay-trieu-cuong-dat-dinh-20251106185205927.htm) | Dân trí | 2025-11-06 | news | hcm-0011 |
| S24 | [Triều cường đạt đỉnh sáng đầu tuần, người dân TP.HCM đi đường vòng, học sinh xắn quần đi học](https://tuoitre.vn/trieu-cuong-dat-dinh-sang-dau-tuan-nguoi-dan-tphcm-di-duong-vong-hoc-sinh-xan-quan-di-hoc-1002609280705406.htm) | Tuổi Trẻ | 2026-09-28 | news | hcm-0006, hcm-0010, hcm-0011 |
| S25 | [Triều cường dâng cao sáng nay ở TP.HCM, nhiều đường ngập trước ngày đạt đỉnh](https://thanhnien.vn/trieu-cuong-dang-cao-sang-nay-o-tphcm-nhieu-duong-ngap-truoc-ngay-dat-dinh-185260927073451873.htm) | Thanh Niên | 2026-09-27 | news | hcm-0006, hcm-0007 |
| S26 | [Đường thành sông, nhà thành điểm ngập trong ngày triều cường ở TPHCM](https://vietnamnet.vn/duong-thanh-song-nha-thanh-diem-ngap-trong-ngay-trieu-cuong-o-tphcm-2559715.html) | VietNamNet | 2026-09-28 | news | hcm-0005, hcm-0006 |
| S27 | [High tides turn Ho Chi Minh City streets into rivers](https://news.tuoitre.vn/high-tides-turn-ho-chi-minh-city-streets-into-rivers-103251024104336635.htm) | Tuổi Trẻ News | 2025-10-24 | news | hcm-0006, hcm-0007 |
| S28 | [Triều cường tại TP Hồ Chí Minh vượt đỉnh lịch sử, nhiều khu vực ngập trong biển nước](https://vtv.vn/trieu-cuong-tai-tp-ho-chi-minh-vuot-dinh-lich-su-nhieu-khu-vuc-ngap-trong-bien-nuoc-10025110707063616.htm) | VTV | 2025-11-07 | news | hcm-0003, hcm-0005, hcm-0007, hcm-0020, hcm-0021, C16 |
| S29 | [Triều cường vượt bờ chắn Thanh Đa, lút nửa xe ở Hiệp Phước](https://tuoitre.vn/trieu-cuong-vuot-bo-chan-thanh-da-lut-nua-xe-o-hiep-phuoc-20251106174156822.htm) | Tuổi Trẻ | 2025-11-06 | news | hcm-0005, hcm-0010 |
| S30 | [TPHCM: Triều cường dâng cao, nhiều tuyến đường ngập sâu](https://www.sggp.org.vn/tphcm-trieu-cuong-dang-cao-nhieu-tuyen-duong-ngap-sau-post822156.html) | SGGP | 2025-11-06 | news | hcm-0003, hcm-0004, hcm-0010 |
| S31 | [Bung nắp cống 'giải cứu' đường trung tâm TP.HCM ngập trong triều cường](https://tuoitre.vn/bung-nap-cong-giai-cuu-duong-trung-tam-tp-hcm-ngap-trong-trieu-cuong-20231029180941147.htm) | Tuổi Trẻ | 2023-10-29 | news | hcm-0001, hcm-0003 |
| S32 | [TPHCM ngập nặng sau mưa lớn: loạt phương tiện chết máy, nước tràn vào cả xe buýt](https://vietnamnet.vn/tphcm-ngap-nang-sau-mua-lon-loat-phuong-tien-chet-may-nuoc-tran-vao-ca-xe-buyt-2561597.html) | VietNamNet | 2026-10-04 | news | hcm-0016 |
| S33 | [Downpour leaves streets flooded in several parts of Ho Chi Minh City](https://news.tuoitre.vn/downpour-leaves-streets-flooded-in-several-parts-of-ho-chi-minh-city-103250611114510928.htm) | Tuổi Trẻ News | 2025-06-11 | news | hcm-0017, hcm-0021 |
| S34 | [Mưa lớn ào qua 20 phút, nhiều đường ở quận Bình Tân như 'ao cá'](https://tuoitre.vn/mua-lon-ao-qua-20-phut-nhieu-duong-o-quan-binh-tan-nhu-ao-ca-20240925145058694.htm) | Tuổi Trẻ | 2024-09-25 | news | hcm-0017 |
| S35 | [Vì sao mưa 20 phút, nhiều đường ở quận Bình Tân ngập như 'ao cá'?](https://tuoitre.vn/vi-sao-mua-20-phut-nhieu-duong-o-quan-binh-tan-ngap-nhu-ao-ca-20240926124434423.htm) | Tuổi Trẻ | 2024-09-26 | news (citing UBND quận Bình Tân) | hcm-0015, hcm-0017 |
| S36 | [Đầu mùa mưa, khu vực chợ Thủ Đức ở TPHCM lại ngập nặng](https://dantri.com.vn/thoi-su/dau-mua-mua-khu-vuc-cho-thu-duc-o-tphcm-lai-ngap-nang-20250611101554975.htm) | Dân trí | 2025-06-11 | news | hcm-0018, hcm-0019 |
| S37 | [Cấp bách giải quyết ngập khu vực chợ Thủ Đức](https://www.sggp.org.vn/cap-bach-giai-quyet-ngap-khu-vuc-cho-thu-duc-post812486.html) | SGGP | 2025-09-11 | news | hcm-0019 |
| S38 | [Mưa lớn là đường Tô Ngọc Vân, chợ Thủ Đức thành sông: Ngóng dự án hơn 5.000 tỉ](https://tuoitre.vn/mua-lon-la-duong-to-ngoc-van-cho-thu-duc-thanh-song-ngong-du-an-hon-5000-ti-100260912164509047.htm) | Tuổi Trẻ | 2026-09-12 | news | hcm-0018, hcm-0019 |
| S39 | [Mưa lớn giờ cao điểm ở TP.HCM: Đi một đoạn lại dừng đèn đỏ, ngâm chân giữa nước ngập](https://thanhnien.vn/mua-lon-gio-cao-diem-o-tphcm-di-mot-doan-lai-dung-den-do-ngam-chan-giua-nuoc-ngap-185261007205919586.htm) | Thanh Niên | 2026-10-07 | news | hcm-0009, hcm-0011 |
| S40 | [Nghị quyết 1685/NQ-UBTVQH15 về sắp xếp đơn vị hành chính cấp xã của TP.HCM năm 2025](https://luatvietnam.vn/hanh-chinh/nghi-quyet-1685-nq-ubtvqh15-2025-sap-xep-don-vi-hanh-chinh-cap-xa-tp-ho-chi-minh-403012-d1.html) | LuatVietnam (văn bản pháp luật) | 2025-06-16 | official ward-merger resolution (used for ward check only) | — |
| S41 | [Cận cảnh nhiều tuyến đường ở Thành phố Hồ Chí Minh ngập sâu](https://www.vietnamplus.vn/can-canh-nhieu-tuyen-duong-o-thanh-pho-ho-chi-minh-ngap-sau-post1139548.vnp) | VietnamPlus | 2026-10-02 | news | hcm-0024, C12 |
| S42 | [Nếu mưa lớn 30 phút tại TP.HCM, người dân lưu ý những đoạn đường dễ ngập nước nào?](https://tuoitre.vn/neu-mua-lon-30-phut-tai-phcm-nguoi-dan-luu-y-nhung-doan-duong-de-ngap-nuoc-nao-10026092311590247.htm) | Tuổi Trẻ | 2026-09-23 | news (citing 2026 drainage plan) | hcm-0028 |
| S43 | [TPHCM lại mưa lớn kèm sấm sét, nghìn người chật vật vì ngập và kẹt xe](https://vietnamnet.vn/tphcm-lai-mua-lon-kem-sam-set-nghin-nguoi-chat-vat-vi-ngap-va-ket-xe-2562648.html) | VietNamNet | 2026-10-07 | news | hcm-0028 |
| S44 | [Mưa lớn khiến đường ngập sâu, người đi đường ngã nhào giữa dòng nước xiết](https://dantri.com.vn/thoi-su/mua-lon-khien-duong-ngap-sau-nguoi-di-duong-nga-nhao-giua-dong-nuoc-xiet-20260930181627859.htm) | Dân trí | 2026-09-30 | news | hcm-0018, hcm-0025, hcm-0026 |
| S45 | [Đường biến thành sông, nước ngập ngang yên xe máy trong cơn mưa lớn ở TPHCM](https://dantri.com.vn/thoi-tiet/duong-bien-thanh-song-nuoc-ngap-ngang-yen-xe-may-trong-con-mua-lon-o-tphcm-20260930184946211.htm) | Dân trí | 2026-09-30 | news | hcm-0018, hcm-0025 |
| S46 | [Thành phố Hồ Chí Minh: Mưa lớn kết hợp triều cường khiến nhiều khu vực ngập sâu](https://www.vietnamplus.vn/thanh-pho-ho-chi-minh-mua-lon-ket-hop-trieu-cuong-khien-nhieu-khu-vuc-ngap-sau-post1139295.vnp) | VietnamPlus | 2026-09-30 | news | hcm-0010, C22 |
| S47 | [TP.HCM lên kế hoạch giải quyết 50 điểm ngập nặng](https://thanhnien.vn/tphcm-len-ke-hoach-giai-quyet-50-diem-ngap-nang-185261004224119279.htm) | Thanh Niên | 2026-10-05 | news (citing UBND/Sở Xây dựng plan) | hcm-0012, hcm-0014, hcm-0016, hcm-0027, C14 |
| S48 | [Vì sao nhiều điểm ngập ở TP.HCM nay ngập lâu, nước rút chậm?](https://tuoitre.vn/vi-sao-nhieu-diem-ngap-o-tphcm-nay-ngap-lau-nuoc-rut-cham-100261008161043584.htm) | Tuổi Trẻ | 2026-10-08 | news (citing Sở Xây dựng) | hcm-0016, hcm-0026 |
| S49 | [Mưa cả đêm, sáng nay đường Nguyễn Văn Khối, TP.HCM nước ngập mênh mông](https://tuoitre.vn/mua-ca-dem-sang-nay-duong-nguyen-van-khoi-tphcm-nuoc-ngap-menh-mong-10026100808374636.htm) | Tuổi Trẻ | 2026-10-08 | news | hcm-0012 |
| S50 | [Ngã tư Nguyễn Văn Khối - Lê Văn Thọ ở TP.HCM bị ngập, học sinh dắt xe lội nước về nhà](https://tuoitre.vn/nga-tu-nguyen-van-khoi-le-van-tho-o-tphcm-bi-ngap-hoc-sinh-dat-xe-loi-nuoc-ve-nha-100260925175324604.htm) | Tuổi Trẻ | 2026-09-25 | news | hcm-0012 |
| S51 | [Nhiều đường ở TP.HCM ngập nặng tối nay, có nơi nước dâng sát yên xe máy](https://thanhnien.vn/nhieu-duong-o-tphcm-ngap-nang-toi-nay-co-noi-nuoc-dang-sat-yen-xe-may-18526100718053186.htm) | Thanh Niên | 2026-10-07 | news | hcm-0012 |
| S52 | [Đường Phan Huy Ích ở TP.HCM ngập tới 1 mét, người dân lội nước về nhà trong đêm](https://thanhnien.vn/duong-phan-huy-ich-o-tphcm-ngap-toi-1-met-nguoi-dan-loi-nuoc-ve-nha-trong-dem-185260930225838773.htm) | Thanh Niên | 2026-09-30 | news | hcm-0014 |
| S53 | [Bao giờ đường Phan Huy Ích, khu Thảo Điền hết ngập? Sở Xây dựng TP.HCM trả lời](https://thanhnien.vn/bao-gio-duong-phan-huy-ich-khu-thao-dien-het-ngap-so-xay-dung-tphcm-tra-loi-185261008164938974.htm) | Thanh Niên | 2026-10-08 | official (Sở Xây dựng press conference) via newspaper | hcm-0014, hcm-0021, hcm-0024, C15 |
| S54 | [Ngập cửa ngõ sân bay Tân Sơn Nhất, Sở Xây dựng TP.HCM nêu giải pháp](https://thanhnien.vn/ngap-cua-ngo-san-bay-tan-son-nhat-so-xay-dung-tphcm-neu-giai-phap-185261008204929402.htm) | Thanh Niên | 2026-10-08 | official (Sở Xây dựng press conference) via newspaper | hcm-0028 |
| S55 | [Mưa lớn ở TP.HCM chiều tối nay: Nước chảy cuồn cuộn, ngập hơn 1 tiếng](https://thanhnien.vn/mua-lon-o-tphcm-chieu-toi-nay-nuoc-chay-cuon-cuon-ngap-hon-1-tieng-185260918204010853.htm) | Thanh Niên | 2026-09-18 | news | hcm-0018, hcm-0025, hcm-0026 |
| S56 | [Nước chảy cuồn cuộn, giao thông hỗn loạn trong mưa lớn ở TP.HCM giờ tan tầm](https://thanhnien.vn/nuoc-chay-cuon-cuon-giao-thong-hon-loan-trong-mua-lon-o-tphcm-gio-tan-tam-185260922191425244.htm) | Thanh Niên | 2026-09-22 | news | hcm-0009, hcm-0018, hcm-0025, hcm-0026, hcm-0027, C11 |
| S57 | [Triều cường dâng cao, khu vực Chợ Lớn ở TPHCM hoá sông](https://tienphong.vn/trieu-cuong-dang-cao-khu-vuc-cho-lon-o-tphcm-hoa-song-post1793751.tpo) | Tiền Phong | 2025-11-05 | news | hcm-0003, hcm-0029, hcm-0030, hcm-0031, C20 |
| S58 | [Triều cường 'tấn công' khu vực Chợ Lớn ở TPHCM](https://tienphong.vn/trieu-cuong-tan-cong-khu-vuc-cho-lon-o-tphcm-post1798035.tpo) | Tiền Phong | 2025-11-20 | news | hcm-0003, hcm-0006, hcm-0029, hcm-0030, hcm-0031, C05 |
| S59 | [Triều cường chưa đạt đỉnh, nhiều nơi TPHCM đã mênh mông nước](https://vietnamnet.vn/trieu-cuong-chua-dat-dinh-nhieu-noi-tphcm-da-menh-mong-nuoc-2459742.html) | VietNamNet | 2025-11-05 | news | hcm-0010, hcm-0031 |
| S60 | [Triều cường dâng cao, người dân 'ngụp lặn' giữa biển nước](https://tienphong.vn/trieu-cuong-dang-cao-nguoi-dan-ngup-lan-giua-bien-nuoc-post1797702.tpo) | Tiền Phong | 2025-11-19 | news (citing UBND phường Tân Mỹ) | hcm-0003, C20 |
| S61 | [Flooding-prone street submerged as high tides, rain combine in Ho Chi Minh City](https://news.tuoitre.vn/flooding-prone-street-submerged-as-high-tides-rain-combine-in-ho-chi-minh-city-10382059.htm) | Tuổi Trẻ News | 2024-09-21 | news | hcm-0003 |
| S62 | [TP.HCM mưa lớn, 2 xe bồn 'giải cứu' đường Đinh Bộ Lĩnh - Bạch Đằng ngập gần 5 tiếng](https://thanhnien.vn/tphcm-mua-lon-2-xe-bon-giai-cuu-duong-dinh-bo-linh-bach-dang-185261008080309766.htm) | Thanh Niên | 2026-10-08 | news | C11 |
| S63 | [Đêm ở 'rốn ngập' phường Thạnh Mỹ Tây, TP.HCM: Chờ hơn 2 tiếng chưa dám về nhà](https://thanhnien.vn/dem-o-ron-ngap-phuong-thanh-my-tay-tphcm-cho-hon-2-tieng-chua-dam-ve-nha-185261007202202911.htm) | Thanh Niên | 2026-10-07 | news | C10 |
| S64 | [Trung tâm TP.HCM ngập lênh láng ở nhiều tuyến đường trong cơn mưa lớn chiều nay](https://thanhnien.vn/trung-tam-tphcm-ngap-lenh-lang-o-nhieu-tuyen-duong-trong-con-mua-lon-chieu-nay-185260923145317918.htm) | Thanh Niên | 2026-09-23 | news | C01 |
| S65 | [Phường Linh Xuân đề xuất gỡ khó tại dự án Đại học Quốc gia TP.HCM, ngập chợ Thủ Đức và loạt đất công](https://tuoitre.vn/phuong-linh-xuan-de-xuat-go-kho-tai-du-an-dai-hoc-quoc-gia-tp-hcm-ngap-cho-thu-duc-va-loat-dat-cong-20260511194311366.htm) | Tuổi Trẻ | 2026-05-11 | news (citing UBND phường Linh Xuân) | hcm-0019 |
| S66 | [TP.HCM ưu tiên xóa 3 điểm ngập nặng, 47 điểm còn lại ra sao?](https://thanhnien.vn/tphcm-uu-tien-xoa-3-diem-ngap-nang-47-diem-con-lai-ra-sao-185260910183201705.htm) | Thanh Niên | 2026-09-10 | official (Sở Xây dựng press conference) via newspaper | hcm-0010 |
| S67 | [Mưa lớn ở TP.HCM, đường Mã Lò lại thành 'sông', nhiều xe chết máy](https://thanhnien.vn/mua-lon-o-tphcm-duong-ma-lo-lai-thanh-song-nhieu-xe-chet-may-185260925211655974.htm) | Thanh Niên | 2026-09-25 | news (headline only) | hcm-0016 |
| S68 | [Mưa lớn giờ tan tầm, hầm vượt sông Sài Gòn kẹt cứng, đường Mai Chí Thọ ngập như sông](https://thanhnien.vn/mua-lon-gio-tan-tam-ham-vuot-song-sai-gon-ket-cung-duong-mai-chi-tho-ngap-nhu-song-185261001191635746.htm) | Thanh Niên | 2026-10-01 | news | hcm-0023, C16 |
| S69 | [Đường D5 ngập gần 4 tiếng, sinh viên lội nước về nhà: 'Tưởng đang đi biển'](https://thanhnien.vn/duong-d5-ngap-gan-4-tieng-sinh-vien-loi-nuoc-ve-nha-tuong-dang-di-bien-185261007215032567.htm) | Thanh Niên | 2026-10-07 | news | C10 |
| S70 | [Saigon ward](https://en.wikipedia.org/wiki/Saigon_ward) | Wikipedia | 2026-10-09 | reference (cites NQ 1685) | hcm-0001 |
| S71 | [Phố Tây Bùi Viện ngập sâu sau mưa lớn ở TPHCM](https://lifestyle.zingnews.vn/pho-tay-bui-vien-ngap-sau-mua-lon-o-tphcm-post1599949.html) | Znews | 2025-11-05 | news | hcm-0002 |
| S72 | [TP.HCM khởi công dự án chống ngập đường Mã Lò trong tháng 11](https://thanhnien.vn/tphcm-khoi-cong-du-an-chong-ngap-duong-ma-lo-trong-thang-11-185261008165207595.htm) | Thanh Niên | 2026-10-08 | news (headline only) | hcm-0016 |
| S73 | [Mưa lớn từ chiều đến tối, người dân TPHCM chật vật về nhà](https://tienphong.vn/mua-lon-tu-chieu-den-toi-nguoi-dan-tphcm-chat-vat-ve-nha-post1883131.tpo) | Tiền Phong | 2026-10-07 | news (citing CSGT PC08 warnings) | hcm-0029, C13, C21 |
| S74 | [Mưa đã tạnh từ lâu, nhiều nơi ở TP.HCM vẫn ngập tới đầu gối sau hơn 5 tiếng](https://thanhnien.vn/mua-da-tanh-tu-lau-nhieu-noi-o-tphcm-van-ngap-toi-dau-goi-sau-hon-5-tieng-185260930222018673.htm) | Thanh Niên | 2026-09-30 | news | C19 |
| S75 | [Vì sao đường Nguyễn Văn Quá, quận 12 được lắp cống hộp chống ngập nhưng vẫn bị ngập?](https://tuoitre.vn/giaoduc/vi-sao-duong-nguyen-van-qua-quan-12-duoc-lap-cong-hop-chong-ngap-nhung-van-bi-ngap-108883523.htm) | Tuổi Trẻ / Tạp chí Giáo dục | 2024-10-24 | official (Sở Xây dựng chief of office, press conference) via magazine | hcm-0008, hcm-0014 |
| S76 | [Đường Đặng Thùy Trâm ngập tứ phía, hố hào công trình thành 'bẫy' sau mưa](https://tuoitre.vn/duong-dang-thuy-tram-ngap-tu-phia-ho-hao-cong-trinh-thanh-bay-sau-mua-20260611211343799.htm) | Tuổi Trẻ | 2026-06-11 | news (citing UBND phường Bình Lợi Trung) | hcm-0011 |
| S77 | [Vì sao nhiều hẻm ở khu Thảo Điền ngập từ tối đến chiều hôm sau?](https://thanhnien.vn/vi-sao-nhieu-hem-o-khu-thao-dien-ngap-tu-toi-den-chieu-hom-sau-185260921153913999.htm) | Thanh Niên | 2026-09-22 | official (Sở Xây dựng reply) via newspaper | hcm-0020 |
| S78 | [TP.HCM: 'Rốn ngập' Gò Vấp cũ đến năm 2027 mới mong hết ngập?](https://thanhnien.vn/tphcm-ron-ngap-go-vap-cu-den-nam-2027-moi-mong-het-ngap-185251113183232065.htm) | Thanh Niên | 2025-11-14 | official (Sở Xây dựng press conference) via newspaper | hcm-0013 |
| S79 | [TPHCM: Cuộc sống người dân Thanh Đa đảo lộn vì mưa lớn và triều cường](https://tienphong.vn/tphcm-cuoc-song-nguoi-dan-thanh-da-dao-lon-vi-mua-lon-va-trieu-cuong-post1790413.tpo) | Tiền Phong | 2025-10-25 | news (citing UBND phường Bình Quới) | hcm-0010 |

## Notes on the official lists

- **S01 (VnExpress dataset)** is the Sở Xây dựng list of 159 recurring flood points (76 in former HCMC), updated to January 2026. Its ward labels are partly pre-merger (e.g. 'Bến Nghé'), so wards were re-checked against NQ 1685 (S40) and OSM.
- **S08 (CSGT, 6–7 Oct 2026)** is a traffic-police warning list of 122 points (83 rain, 39 tide) published only as infographics; I transcribed the in-scope entries. It gives the most precise sections.
- **S03/S04** give the official average depth for the 26 rain hotspots: 10–30 cm, draining within 30 minutes. **S05/S06** give 0.1–0.3 / 0.15–0.3 m for the tide streets when the tide passes alarm level (1.4 m at Phú An).

## Section narrowing (v3)

Sections were narrowed only where a source names them. Social media was searched for sections only; nothing usable was found (Facebook needs a login).

- 0014 Phan Huy Ích — narrowed to Trường Chinh → Huỳnh Văn Nghệ (official, S75).
- 0020 Nguyễn Văn Hưởng — narrowed to the ≈500 m stretch at alleys 188–204 (official reply, S77).
- 0011 Đặng Thùy Trâm — whole street confirmed (S76 'gần như toàn tuyến').
- 0008 Nguyễn Văn Quá — two flood sources identified (S75), one locatable; whole street kept.
- 0013 Phạm Văn Chiêu, 0010 Bình Quới, 0025 Linh Đông, 0026 Lý Tế Xuyên — no section in any source; whole street kept.
- 0006 Rạch Cùng, 0027 Nguyễn Văn Thương, 0028 Trường Sơn, 0030 Gò Công, 0031 Phú Định — already short (≤1.2 km); no finer section found.
- Võ Văn Kiệt — already split: 0029 is the CSGT section Phạm Phú Thứ – Bình Tiên; 0015 is the Hồ Học Lãm junction.
- 3 Tháng 2 — candidate only (Trong's local knowledge; no public source for the tide section yet).

## Districts with no spots

- **Quận 3**: Only candidates (official 'ngập nhẹ' list, no depth found).
- **Quận 4**: Only candidates (official 'ngập nhẹ' list, no depth found).
- **Quận 10**: Only candidates (official 'ngập nhẹ' list, no depth found).
- **Quận 11**: No Sở XD or CSGT hotspot and no specific flood report found (2023–2026).
- **Phú Nhuận**: No Sở XD or CSGT hotspot and no specific flood report found (2023–2026).
- **Tân Phú**: Only Phan Anh, a boundary street with Bình Tân (candidate, no depth).
