/* https://github.com/PERTS/triton/issues/1701 */

# This new `private` field will control whether the API hides the body of the
# response.

ALTER TABLE `response`
  ADD COLUMN `private` bool NOT NULL DEFAULT 1
  AFTER `type`;

ALTER TABLE `response_backup`
  ADD COLUMN `private` bool NOT NULL DEFAULT 1
  AFTER `type`;

UPDATE `response`
  SET `private` = 1
  WHERE `type` = 'User';
UPDATE `response`
  SET `private` = 0
  WHERE `type` = 'Team';
UPDATE `response_backup`
  SET `private` = 1
  WHERE `type` = 'User';
UPDATE `response_backup`
  SET `private` = 0
  WHERE `type` = 'Team';
