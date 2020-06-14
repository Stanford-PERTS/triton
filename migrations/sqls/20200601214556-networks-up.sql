/* https://github.com/PERTS/triton/issues/1706 */

CREATE TABLE `network` (
  `uid` varchar(50) NOT NULL,
  `short_uid` varchar(50) NOT NULL,
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `name` varchar(200) NOT NULL,
  `program_id` varchar(50) NOT NULL,
  `association_ids` varchar(3500) NOT NULL DEFAULT '[]',
  `code` varchar(50) NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE INDEX code (`code`)
)
  ENGINE=InnoDB
  DEFAULT CHARSET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user`
  ADD COLUMN `owned_networks` varchar(3500)
  NOT NULL DEFAULT '[]'
  AFTER `owned_organizations`;

ALTER TABLE `report`
  ADD COLUMN `network_id` varchar(50)
  DEFAULT NULL
  AFTER `parent_id`;
