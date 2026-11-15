"""Static compatibility checks for the optional simplified Gradio UI.

These checks parse source without importing Torch, Gradio, or a model checkpoint.
Run with unittest discovery; they deliberately avoid network and GPU access.
"""

import ast
import json
import re
import unittest
from pathlib import Path


_ROOT = Path(__file__).resolve().parents[5]
_WIRING_DIR = "acestep/ui/gradio/events/wiring/"
_INTERFACE_DIR = "acestep/ui/gradio/interfaces/"


def _source(path: str) -> str:
    """Read committed repository source for offline contract inspection."""
    return (_ROOT / path).read_text(encoding="utf-8")


def _module(path: str) -> ast.Module:
    """Parse a module without importing its dependency graph."""
    return ast.parse(_source(path), filename=path)


def _definition(tree: ast.Module, name: str) -> ast.FunctionDef:
    """Find a top-level Python function definition by exact name."""
    matches = [
        node for node in tree.body
        if isinstance(node, ast.FunctionDef) and node.name == name
    ]
    if len(matches) != 1:
        raise AssertionError(f"Expected one function {name}, found {len(matches)}")
    return matches[0]


def _call(tree: ast.Module, name: str) -> ast.Call:
    """Locate one call to a named function in a source module."""
    matches = [
        node for node in ast.walk(tree)
        if isinstance(node, ast.Call)
        and isinstance(node.func, ast.Name)
        and node.func.id == name
    ]
    if len(matches) != 1:
        raise AssertionError(f"Expected one call to {name}, found {len(matches)}")
    return matches[0]


class SimpleUiContractTests(unittest.TestCase):
    """Guard fragile contracts when upstream changes the advanced Gradio flow."""

    def test_dispatch_matches_required_progress_arguments(self) -> None:
        """The optional adapter may not shift any positional generation argument."""
        upstream = _definition(
            _module("acestep/ui/gradio/events/results/generation_progress.py"),
            "generate_with_progress",
        )
        adapter = _call(
            _module(_WIRING_DIR + "simple_ui_generation_dispatch.py"),
            "generate_with_progress",
        )
        required = upstream.args.args[:-len(upstream.args.defaults)]
        self.assertEqual(len(adapter.args), len(required))
        for expected, actual in zip(required, adapter.args):
            if expected.arg in ("dit_handler", "llm_handler"):
                self.assertIsInstance(actual, ast.Name)
                self.assertEqual(actual.id, expected.arg)
            elif expected.arg == "is_format_caption":
                self.assertIsInstance(actual, ast.Constant)
                self.assertIs(actual.value, False)
            else:
                self.assertIsInstance(actual, ast.Subscript)
                self.assertIsInstance(actual.value, ast.Name)
                self.assertEqual(actual.value.id, "params")
                self.assertIsInstance(actual.slice, ast.Constant)
                self.assertEqual(actual.slice.value, expected.arg)
        self.assertEqual(
            [arg.arg for arg in adapter.keywords],
            ["retake_variance", "retake_seed", "progress"],
        )

    def test_saved_parameter_snapshot_matches_upstream(self) -> None:
        """Simple-session saved params must retain the advanced replay schema."""
        upstream = _definition(
            _module("acestep/ui/gradio/events/results/batch_management_helpers.py"),
            "_build_saved_params",
        )
        call = _call(
            _module(_WIRING_DIR + "simple_ui_generation_results.py"),
            "_build_saved_params",
        )
        required = upstream.args.args[:-len(upstream.args.defaults)]
        self.assertEqual(len(call.args), len(required))
        for expected, actual in zip(required, call.args):
            self.assertIsInstance(actual, ast.Subscript)
            self.assertIsInstance(actual.slice, ast.Constant)
            self.assertEqual(actual.slice.value, expected.arg)
        self.assertEqual(
            [keyword.arg for keyword in call.keywords],
            ["repaint_mode", "repaint_strength", "retake_variance", "retake_seed"],
        )

    def test_all_new_ui_modules_parse_and_respect_size_limit(self) -> None:
        """Each new UI module must parse and stay within the hard 200-LOC cap."""
        paths = [
            *_ROOT.glob(_WIRING_DIR + "simple_ui*.py"),
            *_ROOT.glob(_INTERFACE_DIR + "simple_ui*.py"),
        ]
        self.assertGreaterEqual(len(paths), 10)
        for path in paths:
            with self.subTest(path=path.name):
                source = path.read_text(encoding="utf-8")
                ast.parse(source, filename=str(path))
                self.assertLessEqual(
                    len(source.splitlines()), 200,
                    f"{path.name} exceeds AGENTS.md hard cap",
                )

    def test_navigation_and_error_state_keep_fourteen_outputs(self) -> None:
        """Keep the full simple-flow Gradio event tuple length stable."""
        helpers = _module(_WIRING_DIR + "simple_ui_helpers.py")
        for name in ("_start_generation", "_generation_failure_updates"):
            func = _definition(helpers, name)
            returns = [x for x in ast.walk(func) if isinstance(x, ast.Return)]
            self.assertEqual(len(returns), 1)
            self.assertIsInstance(returns[0].value, ast.Tuple)
            self.assertEqual(len(returns[0].value.elts), 14)

    def test_advanced_batches_are_not_bound_as_simple_state(self) -> None:
        """The simple flow must not overwrite the advanced eight-slot queue."""
        wiring = _source(_WIRING_DIR + "simple_ui_generation_wiring.py")
        self.assertNotIn('results_section["batch_queue"]', wiring)
        self.assertNotIn('results_section["current_batch_index"]', wiring)
        builder = _source(_INTERFACE_DIR + "simple_ui.py")
        for key in (
            "simple_batch_queue", "simple_current_batch_index",
            "simple_total_batches", "simple_generation_params_state",
        ):
            self.assertIn(f'"{key}":', builder)

    def test_simple_help_uses_visible_modal_not_advanced(self) -> None:
        """The hamburger Help action must only activate a visible Simple modal."""
        builder = _source(_INTERFACE_DIR + "simple_ui.py")
        wiring = _source(_WIRING_DIR + "simple_ui_navigation.py")
        self.assertIn('create_help_button("getting_started")', builder)
        self.assertIn("document.querySelector('#simple-ui-column .help-inline-btn')", wiring)

    def test_model_readiness_never_initializes_services(self) -> None:
        """Initial viewing and switching back to Simple must be read-only."""
        readiness = _source(_WIRING_DIR + "simple_ui_model_readiness.py")
        self.assertNotIn(".initialize_service(", readiness)
        self.assertNotIn(".initialize(", readiness)

    def test_simple_ui_translation_keys_are_defined(self) -> None:
        """UI translation keys always have English fallback values."""
        en = json.loads(_source("acestep/ui/gradio/i18n/en.json"))
        self.assertIn("simple_flow", en)
        files = [
            *_ROOT.glob(_WIRING_DIR + "simple_ui*.py"),
            *_ROOT.glob(_INTERFACE_DIR + "simple_ui*.py"),
        ]
        keys = set()
        for file in files:
            keys.update(re.findall(
                r't\("simple_flow\.([a-zA-Z0-9_]+)"\)',
                file.read_text(encoding="utf-8"),
            ))
        self.assertTrue(keys)
        self.assertFalse(keys - set(en["simple_flow"]))


if __name__ == "__main__":
    unittest.main()
