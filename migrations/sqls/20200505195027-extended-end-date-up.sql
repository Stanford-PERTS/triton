/*
  https://github.com/PERTS/triton/issues/1661
  Extend cycle dates.
*/

ALTER TABLE `cycle`
  ADD COLUMN `extended_end_date` date DEFAULT NULL
  AFTER `end_date`;
