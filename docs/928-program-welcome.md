# Plan for Program Welcome feature


## Ideal

* On perts.net/enage, enter your email address. EP is hard-coded.
* Neptune handles the program label, sends to mandrills s.t. the link has the program label.
* Mandrill correctly builds the email.
* Triton recieves the set password link with program flag
* Triton sees the program label during the welcome modal, turns on an additional page.

### Yellowstone updates

* On perts.net/enage, enter your email address. EP is hard-coded.

    //neptune/api/register

    {
      "email",
      "domain",
      "platform",
      "program_label"
    }

### Neptune updates

* Neptune handles all triton registration _with a program link_
* Migrate "triton" program to "ep18"
  - create ep18.py config file
  - can keep triton.py for existing classrooms
  - References in portal and presurvey
  - Check with DG about other uses

    //triton/set_password/:token?program=ep18

### Triton updates

* Will need to modify the set password flow to pass the program flag through to `/home/ep18`
* Welcome modal recognizes path param and shows welcome options


## MVP

Can I do all this? Not before EOD with all required testing.

How can I put up the UI faster?

The welcome modal can trigger for any user that doesn't have any teams. Later the trigger can change.
