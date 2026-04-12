DELETE FROM showtimes;
DELETE FROM movies;
INSERT INTO movies (id, title, poster, rating, description, shows_per_day, formats, genre, duration, language) VALUES
                                                                                                                   ('1', 'Avatar: Dòng Chảy Của Nước', 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop', 8.7, 'Jake Sully sống cùng gia đình mới của mình trên hành tinh Pandora. Khi một mối đe dọa quen thuộc quay trở lại, Jake phải hợp tác với Neytiri và đội quân của chủng tộc Na''vi để bảo vệ hành tinh của họ.', 4, '2D, 3D, IMAX', 'Hollywood', '192 phút', 'Tiếng Anh (Phụ đề Tiếng Việt)'),

                                                                                                                   ('2', 'Vụ Cướp Thế Kỷ', 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop', 7.2, 'Hai anh em với những con đường rắc rối thấy mình ở giữa một vụ cướp ngân hàng cuối cùng.', 3, '2D', 'Hollywood', '94 phút', 'Tiếng Anh (Phụ đề Tiếng Việt)'),

                                                                                                                   ('3', 'Mai', 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop', 8.5, 'Câu chuyện về cuộc đời của một người phụ nữ tên Mai, với những thăng trầm và tình yêu đầy trắc trở.', 6, '2D', 'Khác', '131 phút', 'Tiếng Việt'),

                                                                                                                   ('4', 'Lật Mặt 7: Một Điều Ước', 'https://images.unsplash.com/photo-1574267432644-f610a4ab5b6b?w=400&h=600&fit=crop', 8.0, 'Câu chuyện cảm động về tình mẫu tử và những đứa con trưởng thành với cuộc sống riêng.', 5, '2D', 'Khác', '138 phút', 'Tiếng Việt'),

                                                                                                                   ('5', 'Biệt Đội Siêu Anh Hùng', 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=400&h=600&fit=crop', 8.1, 'Sử thi siêu anh hùng tập hợp những anh hùng vĩ đại nhất để cứu vũ trụ.', 5, '2D, 3D, IMAX', 'Hollywood', '148 phút', 'Tiếng Anh (Phụ đề Tiếng Việt)'),

                                                                                                                   ('6', 'Kẻ Báo Thù', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=600&fit=crop', 7.3, 'Một đặc vụ DEA tìm cách trả thù cho gia đình mình.', 2, '2D', 'Hollywood', '100 phút', 'Tiếng Anh (Phụ đề Tiếng Việt)'),

                                                                                                                   ('7', 'Avengers: Hồi Kết', 'https://images.unsplash.com/photo-1608889476561-6242cfdbf622?w=400&h=600&fit=crop', 8.9, 'Trận chiến cuối cùng của các siêu anh hùng chống lại Thanos.', 6, '2D, 3D, IMAX', 'Hollywood', '181 phút', 'Tiếng Anh (Phụ đề Tiếng Việt)'),

                                                                                                                   ('8', 'Phù Thủy Tối Thượng', 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=400&h=600&fit=crop', 8.4, 'Hành trình của một bác sĩ phẫu thuật thần kinh trở thành phù thủy tối thượng.', 4, '2D, 3D', 'Hollywood', '115 phút', 'Tiếng Anh (Phụ đề Tiếng Việt)'),

                                                                                                                   ('9', 'Pathaan', 'https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop', 7.9, 'Một điệp viên Ấn Độ đối đầu với thủ lĩnh của một nhóm lính đánh thuê.', 5, '2D, 3D', 'Bollywood', '146 phút', 'Tiếng Hindi (Phụ đề Tiếng Việt)'),

                                                                                                                   ('10', 'Jawan', 'https://images.unsplash.com/photo-1574267432644-f610a4ab5b6b?w=400&h=600&fit=crop', 8.2, 'Hành trình cảm xúc của một người đàn ông quyết tâm sửa chữa những sai trái trong xã hội.', 4, '2D', 'Bollywood', '169 phút', 'Tiếng Hindi (Phụ đề Tiếng Việt)'),

                                                                                                                   ('11', 'RRR', 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=600&fit=crop', 8.6, 'Câu chuyện hư cấu về hai nhà cách mạng huyền thoại.', 3, '2D, 3D', 'Bollywood', '187 phút', 'Tiếng Telugu (Phụ đề Tiếng Việt)');
-- Dữ liệu lịch chiếu khớp y hệt Mock Data của bạn
INSERT INTO showtimes (id, movie_id, time, screen, language, format) VALUES
                                                                         (1, '1', '10:00 AM', 'Phòng 1', 'Tiếng Anh', '3D'),
                                                                         (2, '1', '01:30 PM', 'Phòng 1', 'Tiếng Anh', 'IMAX'),
                                                                         (3, '1', '05:00 PM', 'Phòng 2', 'Tiếng Anh', '3D'),
                                                                         (4, '1', '09:00 PM', 'Phòng 1', 'Tiếng Anh', 'IMAX'),
                                                                         (5, '2', '11:00 AM', 'Phòng 3', 'Tiếng Anh', '2D'),
                                                                         (6, '2', '03:00 PM', 'Phòng 3', 'Tiếng Anh', '2D'),
                                                                         (7, '2', '07:30 PM', 'Phòng 3', 'Tiếng Anh', '2D'),
                                                                         (8, '7', '10:30 AM', 'Phòng 2', 'Tiếng Anh', '3D'),
                                                                         (9, '7', '02:00 PM', 'Phòng 1', 'Tiếng Anh', 'IMAX'),
                                                                         (10, '7', '06:00 PM', 'Phòng 2', 'Tiếng Anh', '3D');