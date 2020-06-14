/*
  https://github.com/PERTS/triton/issues/1645
  Support survey meta data in Copilot

  Also
  https://github.com/PERTS/triton/issues/1674
*/

ALTER TABLE `survey`
  ADD COLUMN `meta` text NOT NULL
  AFTER `open_responses`;
