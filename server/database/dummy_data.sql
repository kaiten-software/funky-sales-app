-- Add more dummy sales entries for testing
-- This will add entries for the last 30 days across multiple POS terminals

USE pos_sales_tracker;

-- Add more sales entries for the last 30 days
INSERT INTO sales_entries (user_id, pos_id, entry_date, status) VALUES
-- Last 30 days for POS 1
(3, 1, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'submitted'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'submitted'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'submitted'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'submitted'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'submitted'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'submitted'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'submitted'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'submitted'),
(3, 1, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'submitted'),

-- Last 30 days for POS 2
(3, 2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'submitted'),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'submitted'),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'submitted'),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'submitted'),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'submitted'),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'submitted'),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'submitted'),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'submitted'),
(3, 2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'submitted'),

-- Last 30 days for POS 3
(2, 3, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'submitted'),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'submitted'),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'submitted'),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'submitted'),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'submitted'),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'submitted'),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'submitted'),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'submitted'),
(2, 3, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'submitted'),

-- Last 30 days for POS 4
(2, 4, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'submitted'),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'submitted'),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'submitted'),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'submitted'),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'submitted'),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'submitted'),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'submitted'),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'submitted'),
(2, 4, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'submitted'),

-- Last 30 days for POS 5
(2, 5, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'submitted'),
(2, 5, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'submitted'),
(2, 5, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'submitted'),
(2, 5, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'submitted'),
(2, 5, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'submitted'),
(2, 5, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'submitted'),
(2, 5, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'submitted'),
(2, 5, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'submitted'),
(2, 5, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'submitted'),

-- Last 30 days for POS 6
(2, 6, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'submitted'),
(2, 6, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'submitted'),
(2, 6, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'submitted'),
(2, 6, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'submitted'),
(2, 6, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'submitted'),
(2, 6, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'submitted'),
(2, 6, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'submitted'),
(2, 6, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'submitted'),
(2, 6, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'submitted'),

-- Last 30 days for POS 7
(2, 7, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'submitted'),
(2, 7, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 'submitted'),
(2, 7, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 'submitted'),
(2, 7, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'submitted'),
(2, 7, DATE_SUB(CURDATE(), INTERVAL 6 DAY), 'submitted'),
(2, 7, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 'submitted'),
(2, 7, DATE_SUB(CURDATE(), INTERVAL 8 DAY), 'submitted'),
(2, 7, DATE_SUB(CURDATE(), INTERVAL 9 DAY), 'submitted'),
(2, 7, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'submitted');

-- Now add sales entry details for all the new entries
-- Entry IDs will be 4 onwards (we already have 3)

-- Generate realistic amounts with variation
INSERT INTO sales_entry_details (sales_entry_id, sales_type_id, amount) VALUES
-- Entry 4 (POS 1, -2 days)
(4, 1, 16500.00), (4, 2, 24000.00), (4, 3, 5500.00), (4, 4, 8200.00), (4, 5, 12300.00),
-- Entry 5 (POS 1, -3 days)
(5, 1, 14200.00), (5, 2, 26500.00), (5, 3, 4800.00), (5, 4, 9100.00), (5, 5, 11500.00),
-- Entry 6 (POS 1, -4 days)
(6, 1, 17800.00), (6, 2, 23000.00), (6, 3, 6200.00), (6, 4, 7800.00), (6, 5, 13400.00),
-- Entry 7 (POS 1, -5 days)
(7, 1, 15600.00), (7, 2, 25500.00), (7, 3, 5100.00), (7, 4, 8900.00), (7, 5, 12100.00),
-- Entry 8 (POS 1, -6 days)
(8, 1, 18200.00), (8, 2, 22500.00), (8, 3, 6800.00), (8, 4, 7200.00), (8, 5, 14200.00),
-- Entry 9 (POS 1, -7 days)
(9, 1, 16800.00), (9, 2, 24500.00), (9, 3, 5400.00), (9, 4, 8600.00), (9, 5, 12800.00),
-- Entry 10 (POS 1, -8 days)
(10, 1, 15200.00), (10, 2, 26000.00), (10, 3, 4900.00), (10, 4, 9300.00), (10, 5, 11800.00),
-- Entry 11 (POS 1, -9 days)
(11, 1, 17400.00), (11, 2, 23500.00), (11, 3, 6100.00), (11, 4, 8100.00), (11, 5, 13200.00),
-- Entry 12 (POS 1, -10 days)
(12, 1, 16200.00), (12, 2, 25000.00), (12, 3, 5300.00), (12, 4, 8700.00), (12, 5, 12500.00),

-- Entry 13-21 (POS 2)
(13, 1, 13500.00), (13, 2, 27000.00), (13, 3, 4500.00), (13, 4, 9500.00), (13, 5, 10800.00),
(14, 1, 14800.00), (14, 2, 25500.00), (14, 3, 5200.00), (14, 4, 8300.00), (14, 5, 12200.00),
(15, 1, 12900.00), (15, 2, 28000.00), (15, 3, 4200.00), (15, 4, 9800.00), (15, 5, 10200.00),
(16, 1, 15500.00), (16, 2, 24800.00), (16, 3, 5600.00), (16, 4, 7900.00), (16, 5, 13100.00),
(17, 1, 13200.00), (17, 2, 27500.00), (17, 3, 4400.00), (17, 4, 9600.00), (17, 5, 10500.00),
(18, 1, 14500.00), (18, 2, 26200.00), (18, 3, 5100.00), (18, 4, 8500.00), (18, 5, 11900.00),
(19, 1, 12600.00), (19, 2, 28500.00), (19, 3, 4100.00), (19, 4, 10000.00), (19, 5, 9900.00),
(20, 1, 15800.00), (20, 2, 24200.00), (20, 3, 5800.00), (20, 4, 7600.00), (20, 5, 13500.00),
(21, 1, 13800.00), (21, 2, 27200.00), (21, 3, 4600.00), (21, 4, 9400.00), (21, 5, 11200.00),

-- Entry 22-30 (POS 3)
(22, 1, 19200.00), (22, 2, 21500.00), (22, 3, 7200.00), (22, 4, 6800.00), (22, 5, 15200.00),
(23, 1, 18500.00), (23, 2, 22800.00), (23, 3, 6500.00), (23, 4, 7500.00), (23, 5, 14100.00),
(24, 1, 20100.00), (24, 2, 20200.00), (24, 3, 7800.00), (24, 4, 6200.00), (24, 5, 16500.00),
(25, 1, 18800.00), (25, 2, 22100.00), (25, 3, 6800.00), (25, 4, 7200.00), (25, 5, 14600.00),
(26, 1, 19800.00), (26, 2, 21000.00), (26, 3, 7500.00), (26, 4, 6500.00), (26, 5, 15800.00),
(27, 1, 18200.00), (27, 2, 23200.00), (27, 3, 6200.00), (27, 4, 7800.00), (27, 5, 13800.00),
(28, 1, 20500.00), (28, 2, 19800.00), (28, 3, 8100.00), (28, 4, 5900.00), (28, 5, 17200.00),
(29, 1, 19100.00), (29, 2, 21800.00), (29, 3, 7100.00), (29, 4, 6900.00), (29, 5, 15100.00),
(30, 1, 18600.00), (30, 2, 22500.00), (30, 3, 6600.00), (30, 4, 7400.00), (30, 5, 14300.00),

-- Entry 31-39 (POS 4)
(31, 1, 17200.00), (31, 2, 23800.00), (31, 3, 5900.00), (31, 4, 8200.00), (31, 5, 13500.00),
(32, 1, 16500.00), (32, 2, 24500.00), (32, 3, 5500.00), (32, 4, 8600.00), (32, 5, 12800.00),
(33, 1, 18100.00), (33, 2, 22900.00), (33, 3, 6400.00), (33, 4, 7700.00), (33, 5, 14400.00),
(34, 1, 16800.00), (34, 2, 24200.00), (34, 3, 5700.00), (34, 4, 8400.00), (34, 5, 13200.00),
(35, 1, 17800.00), (35, 2, 23200.00), (35, 3, 6200.00), (35, 4, 7900.00), (35, 5, 14100.00),
(36, 1, 16200.00), (36, 2, 25000.00), (36, 3, 5400.00), (36, 4, 8800.00), (36, 5, 12500.00),
(37, 1, 18500.00), (37, 2, 22500.00), (37, 3, 6700.00), (37, 4, 7400.00), (37, 5, 14900.00),
(38, 1, 17100.00), (38, 2, 24000.00), (38, 3, 5800.00), (38, 4, 8300.00), (38, 5, 13400.00),
(39, 1, 16900.00), (39, 2, 24300.00), (39, 3, 5600.00), (39, 4, 8500.00), (39, 5, 13000.00),

-- Entry 40-48 (POS 5)
(40, 1, 14500.00), (40, 2, 26500.00), (40, 3, 4800.00), (40, 4, 9200.00), (40, 5, 11500.00),
(41, 1, 15200.00), (41, 2, 25800.00), (41, 3, 5200.00), (41, 4, 8800.00), (41, 5, 12200.00),
(42, 1, 13800.00), (42, 2, 27200.00), (42, 3, 4500.00), (42, 4, 9500.00), (42, 5, 10800.00),
(43, 1, 15800.00), (43, 2, 25200.00), (43, 3, 5500.00), (43, 4, 8500.00), (43, 5, 12800.00),
(44, 1, 14200.00), (44, 2, 26800.00), (44, 3, 4700.00), (44, 4, 9300.00), (44, 5, 11200.00),
(45, 1, 15500.00), (45, 2, 25500.00), (45, 3, 5300.00), (45, 4, 8700.00), (45, 5, 12500.00),
(46, 1, 13500.00), (46, 2, 27500.00), (46, 3, 4400.00), (46, 4, 9600.00), (46, 5, 10500.00),
(47, 1, 16000.00), (47, 2, 25000.00), (47, 3, 5600.00), (47, 4, 8400.00), (47, 5, 13000.00),
(48, 1, 14800.00), (48, 2, 26200.00), (48, 3, 4900.00), (48, 4, 9100.00), (48, 5, 11800.00),

-- Entry 49-57 (POS 6)
(49, 1, 20500.00), (49, 2, 19500.00), (49, 3, 8200.00), (49, 4, 5800.00), (49, 5, 17500.00),
(50, 1, 19800.00), (50, 2, 20800.00), (50, 3, 7500.00), (50, 4, 6500.00), (50, 5, 16200.00),
(51, 1, 21200.00), (51, 2, 18800.00), (51, 3, 8800.00), (51, 4, 5200.00), (51, 5, 18500.00),
(52, 1, 20100.00), (52, 2, 20200.00), (52, 3, 7800.00), (52, 4, 6200.00), (52, 5, 16800.00),
(53, 1, 19500.00), (53, 2, 21200.00), (53, 3, 7200.00), (53, 4, 6800.00), (53, 5, 15800.00),
(54, 1, 21500.00), (54, 2, 18500.00), (54, 3, 9100.00), (54, 4, 4900.00), (54, 5, 19200.00),
(55, 1, 20800.00), (55, 2, 19800.00), (55, 3, 8500.00), (55, 4, 5500.00), (55, 5, 17800.00),
(56, 1, 19200.00), (56, 2, 21500.00), (56, 3, 7100.00), (56, 4, 6900.00), (56, 5, 15500.00),
(57, 1, 20600.00), (57, 2, 20000.00), (57, 3, 8100.00), (57, 4, 5900.00), (57, 5, 17200.00),

-- Entry 58-66 (POS 7)
(58, 1, 16800.00), (58, 2, 24200.00), (58, 3, 5700.00), (58, 4, 8300.00), (58, 5, 13200.00),
(59, 1, 17500.00), (59, 2, 23500.00), (59, 3, 6100.00), (59, 4, 7900.00), (59, 5, 13900.00),
(60, 1, 16200.00), (60, 2, 25000.00), (60, 3, 5400.00), (60, 4, 8600.00), (60, 5, 12600.00),
(61, 1, 18000.00), (61, 2, 23000.00), (61, 3, 6400.00), (61, 4, 7600.00), (61, 5, 14500.00),
(62, 1, 16500.00), (62, 2, 24500.00), (62, 3, 5600.00), (62, 4, 8400.00), (62, 5, 12900.00),
(63, 1, 17800.00), (63, 2, 23200.00), (63, 3, 6200.00), (63, 4, 7800.00), (63, 5, 14200.00),
(64, 1, 16100.00), (64, 2, 25200.00), (64, 3, 5300.00), (64, 4, 8700.00), (64, 5, 12400.00),
(65, 1, 18200.00), (65, 2, 22800.00), (65, 3, 6600.00), (65, 4, 7400.00), (65, 5, 14800.00),
(66, 1, 17200.00), (66, 2, 24000.00), (66, 3, 5900.00), (66, 4, 8100.00), (66, 5, 13600.00);

COMMIT;
