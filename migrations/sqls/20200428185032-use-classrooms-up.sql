/* triton #1641 add mset */

ALTER TABLE `program`
  ADD COLUMN `use_classrooms` tinyint(1) NOT NULL DEFAULT 1
  AFTER `use_cycles`;
