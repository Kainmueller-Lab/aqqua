import csv
import json
from pathlib import Path



def _load_data_files():
    """Load the data files listed in filelist.json in the order provided."""
    repo_root = Path(__file__).resolve().parents[1]
    data_dir = repo_root / "assets" / "data"
    filelist_path = data_dir / "filelist.json"
    with filelist_path.open("r", encoding="utf-8") as handle:
        filenames = json.load(handle)
    return data_dir, filenames


def _parse_numeric(value):
    """Convert a CSV field to a float, or return None when empty."""
    if value is None:
        return None
    cleaned = value.strip()
    if not cleaned:
        return None
    cleaned = cleaned.replace(",", "")
    try:
        return float(cleaned)
    except ValueError:
        return None


def _format_number(value):
    """Return a human-friendly string with thousands separators."""
    if value is None:
        return "None"
    numeric = float(value)
    if numeric.is_integer():
        return f"{int(numeric):,}"
    return f"{numeric:,.2f}"


def test_data_values_are_monotonic_non_decreasing():
    data_dir, filenames = _load_data_files()
    values_by_category = {}

    for csv_name in filenames:
        csv_path = data_dir / csv_name
        assert csv_path.exists(), f"Data file '{csv_name}' listed in filelist.json is missing."

        category_totals = {}
        with csv_path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle, skipinitialspace=True)
            for row in reader:
                for column, raw_value in row.items():
                    if column is None:
                        continue
                    normalized_column = column.strip()
                    if normalized_column.lower() in {"label", "other"}:
                        continue
                    numeric_value = _parse_numeric(raw_value)
                    if numeric_value is None:
                        continue
                    category_totals[normalized_column] = category_totals.get(normalized_column, 0.0) + numeric_value

        for category, total in category_totals.items():
            values_by_category.setdefault(category, []).append((csv_name, total))

    decreasing_entries = []
    for category, entries in values_by_category.items():
        if len(entries) < 2:
            continue
        previous_file, previous_value = entries[0]
        for current_file, current_value in entries[1:]:
            if current_value < previous_value:
                delta = current_value - previous_value
                decreasing_entries.append(
                    (
                        category,
                        previous_file,
                        previous_value,
                        current_file,
                        current_value,
                        delta,
                    )
                )
            else:
                previous_file, previous_value = current_file, current_value

    assert not decreasing_entries, (
        "Found decreasing values for categories:\n" +
        "\n".join(
            f"{category}: {prev_file} ({_format_number(prev_value)}) -> "
            f"{curr_file} ({_format_number(curr_value)}) | Δ {_format_number(delta)}"
            for (
                category,
                prev_file,
                prev_value,
                curr_file,
                curr_value,
                delta,
            ) in decreasing_entries
        )
    )

if __name__ == "__main__":
    test_data_values_are_monotonic_non_decreasing()
    print("All data values are monotonic non-decreasing.")