/* triton #1634 organization term */

ALTER TABLE `program`
  ADD COLUMN `organization_term` varchar(50) NOT NULL DEFAULT 'Community'
  AFTER `member_term`;
