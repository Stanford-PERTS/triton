/* triton #1574 preview survey url */

ALTER TABLE `program`
  ADD COLUMN `preview_url` varchar(1000) NOT NULL
  AFTER `member_term`;
