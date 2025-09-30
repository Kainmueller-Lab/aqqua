import pandas as pd
import numpy as np
import os
import json
import matplotlib.pyplot as plt

def load_and_group_data(tsv_path):
	"""
	Load the TSV file and group data by instrument.
	"""
	
	# 1. Read the TSV

	df = pd.read_csv(tsv_path, sep='\t')
	print("Data loaded successfully.")
	# show the first few rows of the dataframe
	print(df.head())

	# 2. Convert “Nb objects” to numeric (null → 0)
	df['Nb objects'] = pd.to_numeric(df['Nb objects'], errors='coerce').fillna(0)
	df['%validated'] = df['%validated'].str.rstrip('%').astype(float).div(100)
	# df['%validated'] = pd.to_numeric(df['%validated'], errors='coerce').fillna(0)
	df['validated_count'] = df['Nb objects'] * df['%validated'] / 100
	df['validated_count'] = df['validated_count'].fillna(0)
	df['unvalidated_count'] = df['Nb objects'] - df['validated_count']
	df['unvalidated_count'] = df['unvalidated_count'].fillna(0)

	print(df.head())

	# 3. Group by Instrument and sum each metric separately
	grouped_data = pd.DataFrame({
		'Nb objects': df.groupby('Instrument')['Nb objects'].sum(),
		'validated_count': df.groupby('Instrument')['validated_count'].sum(),
		'unvalidated_count': df.groupby('Instrument')['unvalidated_count'].sum(),
	})
	grouped = grouped_data['Nb objects'].sort_values(ascending=False)

	print(grouped_data.head())


	# Add 100 million to the instrument IFCB
	# grouped['IFCB'] = grouped.get('IFCB', 0) + 636_192_184
	
	# Add CPICS data entries
	# grouped['CPICS_6MP'] = grouped.get('CPICS_6MP', 0) + 93_414_698
	# grouped['CPICS_12MP'] = grouped.get('CPICS_12MP', 0) + 140_159_893

	# Add PlanktonImager data entries
	# grouped['PlanktonImager'] = grouped.get('PlanktonImager', 0) + 1_130_089_666

	# Print the grouped data
	print("\nGrouped data by instrument:")
	print(grouped)
	return grouped

def combine_data(grouped, other_data_path: str):
	
	# 4. Save data to CSV file
	

	# Load other data from other_{month} file and add to grouped
	if os.path.exists(other_data_path):
		print(f"Loading additional data from {other_data_path}...")
		other_df = pd.read_csv(other_data_path)
		
		# The CSV has instruments as columns, so we need to transpose and handle it differently
		if len(other_df.columns) > 2:  # Multiple instrument columns
			# Take the first row of data (skip header if needed)
			if len(other_df) > 1:
				data_row = other_df.iloc[1]  # Second row contains the data
			else:
				data_row = other_df.iloc[0]  # First row contains the data
			
			# Add each instrument's data to grouped
			for instrument, count in data_row.items():
				# Clean up instrument name (remove extra spaces)
				instrument = str(instrument).strip()
				if pd.notna(count) and str(count).strip():
					count_numeric = pd.to_numeric(str(count).replace(',',''), errors='coerce')
					if pd.notna(count_numeric):
						if instrument in grouped.index:
							grouped[instrument] = grouped[instrument] + count_numeric
						else:
							grouped[instrument] = count_numeric
		else:
			# Handle the original expected format (2 columns)
			other_df.columns = ['Instrument', 'Nb objects']
			other_df['Nb objects'] = pd.to_numeric(other_df['Nb objects'], errors='coerce').fillna(0)
			other_series = other_df.set_index('Instrument')['Nb objects']
			for instrument, count in other_series.items():
				grouped[instrument] = grouped.get(instrument, 0) + count

	# List of instrument prefixes to group
	instruments_to_group = ["UVP", "CPICS"]
	
	for instrument_prefix in instruments_to_group:
		mask = grouped.index.str.startswith(instrument_prefix)
		if mask.any():
			instrument_sum = grouped[mask].sum()
			grouped = grouped[~mask]
			grouped[instrument_prefix] = instrument_sum
	

	
	# Print instruments that will be grouped into "Other" before grouping
	threshold_other = 0.0025
	total = grouped.sum()
	small = grouped[grouped / total < threshold_other]
	if not small.empty:
		print(f"\nInstruments being grouped into 'Other' (< {threshold_other*100:.2f}% of total):")
		for instr, count in small.items():
			percentage = (count / total) * 100
			print(f"  {instr}: {count:,.0f} ({percentage:.3f}%)")
		print(f"Total for 'Other': {small.sum():,.0f}")
		
		# Group small instruments into "Other"
		other_sum = small.sum()
		grouped = grouped.drop(small.index)
		grouped['Other'] = grouped.get('Other', 0) + other_sum

	grouped = grouped.sort_values(ascending=False)

	# Merge any “Other camera” entry into the “Other” bucket
	if "Other camera" in grouped.index:
		other_cam_count = grouped.pop("Other camera")
		grouped["Other"] = grouped.get("Other", 0) + other_cam_count
		grouped = grouped.sort_values(ascending=False)

	# Merge any “?” entry into the “Other” bucket
	if "?" in grouped.index:
		unknown_count = grouped.pop("?")
		grouped["Other"] = grouped.get("Other", 0) + unknown_count
		grouped = grouped.sort_values(ascending=False)
	# Group instruments with less than 5% of the total into "Other"
	# threshold_other = 0.0025
	# total = grouped.sum()
	# small = grouped[grouped / total < threshold_other]
	# if not small.empty:
	# 	other_sum = small.sum()
	# 	grouped = grouped.drop(small.index)
	# 	grouped['Other'] = other_sum
	# 	grouped = grouped.sort_values(ascending=False)

	print("\nFinal grouped data:")
	print(grouped)

	return grouped	
	
def save_and_plot_data(date: str, grouped: pd.DataFrame):

	year = date[:4]
	month = date[4:6]
	day = date[6:]

	date_label = f"{year}/{month}"
	instruments_ordered: list = list(grouped.index)
	
	# Create the CSV content
	header = "Label, " + ", ".join(instruments_ordered)
	counts = [str(int(grouped.loc[instr])) for instr in instruments_ordered]  # No commas in the numbers for CSV
	data_row = f"{date_label}, " + ", ".join(counts)
	csv_content = header + "\n" + data_row
	
	# Save to CSV file
	data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets", "data")
	csv_filename = f"{year}_{month}.csv"
	csv_path = os.path.join(data_dir, csv_filename)
	# Ensure the directory exists
	os.makedirs(os.path.dirname(csv_path), exist_ok=True)
	# Write the CSV content to the file
	print(f"\nSaving data to {csv_filename}...")
	with open(csv_path, 'w') as f:
		f.write(csv_content)

	
	# Add the filename to assets/data/filelist.json
	filelist_path = os.path.join(data_dir, "filelist.json")
	# load the filelist
	if os.path.exists(filelist_path):
		with open(filelist_path, "r") as fl:
			filelist = json.load(fl)
	else:
		filelist = []
	# add file to the filelist
	if csv_filename not in filelist:
		filelist.append(csv_filename)
		with open(filelist_path, "w") as fl:
			json.dump(filelist, fl, indent=2)
	
	

	
	# Also print the data to console
	print("Data saved to CSV:")
	print(header)
	print(data_row)
	print(f"Total: {grouped.sum():,.0f}")
	
	# 5. Plot stacked horizontal bar
	plt.figure(figsize=(16,6))
	
	# Print the number of images by instrument in a tabular format
	date_label = date[:4] + '/' + date[4:6]
	instruments_ordered = list(grouped.index)
	
	# Print header with all instrument names
	print("\n" + "Label, " + ", ".join(instruments_ordered))
	
	# Print the row with counts
	counts_formatted = [f"{grouped[instr]:,.0f}" for instr in instruments_ordered]
	print(f"{date_label}, " + ", ".join(counts_formatted))
	
	# Also print the total
	print(f"Total: {grouped.sum():,.0f}")

def plot_data_overview(date: str, grouped: pd.DataFrame):



	fig, ax = plt.subplots(figsize=(12,2)) 

	# leave room to display up to 500 million objects on the x-axis
	plt.xlim(0, 2_000_000_000)
	# Convert to numpy array for cumulative sum
	values = np.array(grouped.values)
	instruments = grouped.index
	cumulative = np.insert(values.cumsum()[:-1], 0, 0)
	# removed redundant figure call to avoid creating a second plot
	# plt.figure(figsize=(12,2))
	for instr, val, left in zip(instruments, values, cumulative):
		plt.barh(0, val, left=left, label=instr)
	plt.xlabel('Total number of objects (in 100 Millions)')
	plt.yticks([])
	plt.title('Images already provided to the AqQua Project by instrument')
	# plt.legend(
	# 	loc='upper center',
	# 	bbox_to_anchor=(0.5, -0.15),
	# 	ncol=5,
	# 	fontsize='small'
	# )
	plt.subplots_adjust(bottom=0.25)
	plt.subplots_adjust(bottom=0.4)
	box = ax.get_position()
	ax.set_position([box.x0, box.y0, box.width, box.height])
	ax.legend(
		loc='upper center',
		bbox_to_anchor=(0.5, -0.5),
		ncol=len(instruments),
		fontsize='small'
	)
	
	# Save the figure
	print("Saving figure...")
	# Save the figure in the "assets" folder, one level above and in a different folder
	assets_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "assets")
	plot_path = os.path.join(assets_dir, f'data_collection_overview_{date}.png')
	plt.savefig(plot_path, dpi=150)

def main():
	# Load the TSV. Adjust path if needed.
	date = '20250929'
	month = date[4:6]
	
	tsv_path = os.path.join(os.path.dirname(__file__), f'ecotaxa_project_overviews/Ecotaxa_projects-list_{date}.tsv')
	other_data_path = os.path.join(os.path.dirname(__file__), f'other_{month}.csv')


	grouped = load_and_group_data(tsv_path)

	# save ecotaxa grouped data to CSV
	grouped.columns = ['Instrument', 'Nb objects']
	grouped.to_csv(os.path.join(os.path.dirname(__file__), 'intermediate_data', f'ecotaxa_{date}_grouped.csv'), index=False)

	grouped_final= combine_data( grouped, other_data_path)

	save_and_plot_data(date, grouped_final)
	# Save the final grouped data to CSV and plot

if __name__ == "__main__":
	main()