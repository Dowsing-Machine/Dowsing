# Dowsing
A Task-Driven Approach for Multiple-View Visualizations Dynamic Recommendation

> NOTE: This project is still under development, some features may be temporarily unavailable.

## Development
### For frontend
1. Run `npm i` to install the dependencies.
2. Start vite development server by `npm run dev`.

### For backend
1. Open folder `backend`.
2. (Optional) Create a virtual environment by `python -m venv <directory>` and activate it.
3. Run `pip install -r requirements.txt` to install the dependencies.
4. Run `python main.py` to start the development server.

> NOTE: We are working on implementing the feature to upload datasets. If you want to use your own dataset now, you can put your dataset into the `public/datasets` folder and indicate the data type of each field in the `meta.json` file. Finally, you should change the `src/components/DatasetSelect.vue` file to add your new dataset.

## Deploy
### Frontend build
Use `npm run build` to build a production version of dowsing.

### Backend deploy
See [flask documents](https://flask.palletsprojects.com/en/2.1.x/tutorial/deploy/).
