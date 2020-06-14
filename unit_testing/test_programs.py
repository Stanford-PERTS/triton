from model import Program
from unit_test_helper import ConsistencyTestCase

class TestPrograms(ConsistencyTestCase):

    def set_up(self):
        super(TestPrograms, self).set_up()

    def test_enforces_that_cycleless_programs_have_one_cycle(self):
        with self.assertRaises(Exception):
          program = Program.create(
            use_cycles=False,
            min_cycles=1,
            max_cycles=2
          )
