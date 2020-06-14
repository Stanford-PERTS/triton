/* https://github.com/PERTS/triton/issues/1706 */

DROP TABLE `network`;

ALTER TABLE `user` DROP COLUMN `owned_networks`;

ALTER TABLE `report` DROP COLUMN `network_id`;
