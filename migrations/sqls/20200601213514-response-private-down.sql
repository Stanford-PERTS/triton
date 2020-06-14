/* https://github.com/PERTS/triton/issues/1701 */

ALTER TABLE `response` DROP COLUMN `private`;
ALTER TABLE `response_backup` DROP COLUMN `private`;
