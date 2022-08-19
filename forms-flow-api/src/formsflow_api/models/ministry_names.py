class MinistryNames():
  def __init__(self, data):
    self.data = list(map(lambda x: x["descr"], data))