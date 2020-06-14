# 845 ep migration

## Iterim

This period has program-aware features, but no way to specify the program that a new team is associated with. Instead, all teams get associated with the EP because it's hard coded. If the EP is not found in the database (label `ep18`) the app should error.

This should take effect with release 1.5. These steps will be necessary during the maintenance window:

1. Apply all db patches created during 1.5 development.
2. Create an entry in the program table for the EP program (again, label `ep18`).
3. Update all teams to have the matching program id.

## Copilot 2.0, Fall 2019

This release should support multiple programs. Teams will have a program association on creation based on what organization they're associated with. An organization will be required to create a team. All organizations will require a program on creation.

Code for this is already mostly in place in the POST handler for `/api/teams`, although it is being skipped because of the hard-coded value of `always_use_ep` as `True`.

To migrate, change this value to `False` (and refactor out the conditional, which we don't need any more) and ensure server tests pass. Again, specifying an org when creating a team should be required, as should specifying a program when creating an org.

During the maintenance window:

1. Update all existing orgs to with the EP's program id, or delete them.
