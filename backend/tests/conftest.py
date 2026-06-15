"""Point the data dir at a throwaway temp location before the app imports."""
import os
import tempfile

os.environ.setdefault(
    "PIDSIM_DATA_DIR", tempfile.mkdtemp(prefix="pidsim-test-data-")
)
