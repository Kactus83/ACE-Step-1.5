"""Position mapping for the existing Gradio generation-progress contract.

The advanced progress event emits eight audio outputs followed by metadata,
status and seed state. Keep indexes centralized until the upstream contract
has a named result type.
"""

AUDIO_PATHS_INDEX = 8
GENERATION_INFO_INDEX = 9
PROGRESS_STATUS_INDEX = 10
SEED_VALUE_INDEX = 11
