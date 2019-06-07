import os

import pandas as pd
import numpy as np

import json

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/zipcodes2.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
zipcode_data = Base.classes.zipcode_data


@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

@app.route("/geojson")
def geojson():
    """Return the homepage."""
    # geojson = pd.read_json()
    # json_string = json.dumps('ca_california_zip_codes_geo.min.json')
    with open('ca_california_zip_codes_geo.min.json', 'r') as f:
            datastore = json.load(f)
    # datastore = json.load('ca_california_zip_codes_geo.min.json')
    # datastore = json.loads(json_string)
    return(jsonify(datastore))

@app.route("/income")
def income():
    """Return the list of zipcodes sorted by income (descending)."""
    sel = [
        zipcode_data.zipcode,
        zipcode_data.income, # Average invidiual income
    ]

    results = db.session.query(*sel).filter(zipcode_data.state == "06").all()

    # for result in results:
    #     print(result)

    # Create dataframe for results, to be sorted
    df = pd.DataFrame({
        "zipcode":[],
        "income":[]
    })

    # Counter for populating dataframe
    zipcodes=[]
    incomes=[]

    # Loop through results and create dataframe
    for result in results:
        zipcodes.append(result[0])
        incomes.append(result[1])

    df=pd.DataFrame({
        "zipcode":zipcodes,
        "income":incomes
    })
    
    # Sort dataframe
    sorted_df=df.sort_values(by=["income"],ascending=False)

    # Take top 10 zips from sorted dataframe
    shorted_df=sorted_df["zipcode"][0:10]

    # Return sorted zipcodes
    return(jsonify(list(shorted_df)))


@app.route("/crime")
def crime():
    """Return the list of zipcodes sorted by crime (ascending)."""
    sel = [
        zipcode_data.zipcode,
        zipcode_data.crime, # Crime - 100 = national average
    ]

    results = db.session.query(*sel).filter(zipcode_data.state == "06").all()

    # Create dataframe for results, to be sorted
    df = pd.DataFrame({
        "zipcode":[],
        "crime":[]
    })

    # Counter for populating dataframe
    zipcodes=[]
    crimes=[]

    # Loop through results and create dataframe
    for result in results:
        zipcodes.append(result[0])
        crimes.append(result[1])

    df=pd.DataFrame({
        "zipcode":zipcodes,
        "crime":crimes
    })
    
    # Sort dataframe
    sorted_df=df.sort_values(by=["crime"],ascending=True)

    # Take top 10 zips from sorted dataframe
    shorted_df=sorted_df["zipcode"][0:10]

    # Return sorted zipcodes
    return(jsonify(list(shorted_df)))

@app.route("/education")
def education():
    """Return the list of zipcodes sorted by education (descending)."""
    sel = [
        zipcode_data.zipcode,
        zipcode_data.education, # % of daytime population with a bachelors degree
    ]

    results = db.session.query(*sel).filter(zipcode_data.state == "06").all()

    # Create dataframe for results, to be sorted
    df = pd.DataFrame({
        "zipcode":[],
        "pct_bach":[]
    })

    # Counter for populating dataframe
    zipcodes=[]
    pct_bachs=[]

    # Loop through results and create dataframe
    for result in results:
        zipcodes.append(result[0])
        pct_bachs.append(result[1])

    df=pd.DataFrame({
        "zipcode":zipcodes,
        "pct_bach":pct_bachs
    })
    
    # Sort dataframe
    sorted_df=df.sort_values(by=["pct_bach"],ascending=False)

    # Take top 10 zips from sorted dataframe
    shorted_df=sorted_df["zipcode"][0:10]

    # Return sorted zipcodes
    return(jsonify(list(shorted_df)))

@app.route("/climate")
def climate():
    """Return the list of zipcodes sorted by average january temperature (descending)."""
    sel = [
        zipcode_data.zipcode,
        zipcode_data.jan_avg_temp, # Average invidiual income
    ]

    results = db.session.query(*sel).filter(zipcode_data.state == "06").all()

    # Create dataframe for results, to be sorted
    df = pd.DataFrame({
        "zipcode":[],
        "jan_avg_temp":[]
    })

    # Counter for populating dataframe
    zipcodes=[]
    jan_avg_temps=[]

    # Loop through results and create dataframe
    for result in results:
        zipcodes.append(result[0])
        jan_avg_temps.append(result[1])

    df=pd.DataFrame({
        "zipcode":zipcodes,
        "jan_avg_temp":jan_avg_temps
    })
    
    # Sort dataframe
    sorted_df=df.sort_values(by=["jan_avg_temp"],ascending=False)

    # Take top 10 zips from sorted dataframe
    shorted_df=sorted_df["zipcode"][0:10]

    # Return sorted zipcodes
    return(jsonify(list(shorted_df)))

@app.route("/cost")
def cost():
    """Return the list of zipcodes sorted by cost of living (ascending)."""
    sel = [
        zipcode_data.zipcode,
        zipcode_data.cost_of_living, # Average invidiual income
    ]

    results = db.session.query(*sel).filter(zipcode_data.state == "06").all()

    # Create dataframe for results, to be sorted
    df = pd.DataFrame({
        "zipcode":[],
        "cost_of_living":[]
    })

    # Counter for populating dataframe
    zipcodes=[]
    cost_of_livings=[]

    # Loop through results and create dataframe
    for result in results:
        zipcodes.append(result[0])
        cost_of_livings.append(result[1])

    df=pd.DataFrame({
        "zipcode":zipcodes,
        "cost_of_living":cost_of_livings
    })
    
    # Sort dataframe
    sorted_df=df.sort_values(by=["cost_of_living"],ascending=True)

    # Take top 10 zips from sorted dataframe
    shorted_df=sorted_df["zipcode"][0:10]

    # Return sorted zipcodes
    return(jsonify(list(shorted_df)))


@app.route("/zipcodes")
def zipcode():
    """Return the stats for all zipcodes in CA."""
    sel = [
        zipcode_data.zipcode,
        zipcode_data.income, # Average invidiual income
        zipcode_data.crime, # Total crime - 100 = average
        zipcode_data.education, # Total population with a bachelors degree
        zipcode_data.jan_avg_temp, # Daytime population of the zip
        zipcode_data.cost_of_living, # Average temperature in January
        zipcode_data.state, # Costs associated with owned dwellings
        # zipcode_data.latitude,
        # zipcode_data.longitude,
        # zipcode_data.state,
    ]

    results = db.session.query(*sel).filter(zipcode_data.state == "06").all()

    # Create a dictionary for each zip code
    zip_info = {}

    # Loop through each result
    for result in results:
        # Create primaryzip code key
        zip_info[result[0]] = {
            # Populate dictionary entry with a second dictionary
            "income":result[1],
            "crime":result[2],
            "education":result[3],
            "winter_temp":result[4],
            "cost_of_living":result[5],
            # "lat":result[7],
            # "lon":result[8],
        }

    # print(zip_info)
    return jsonify(zip_info)


@app.route("/averages")
def avgs():
    """Return the average for each stat for all zipcodes in CA."""
    sel = [
        zipcode_data.zipcode,
        zipcode_data.income, # Average invidiual income
        zipcode_data.crime, # Total crime - 100 = average
        zipcode_data.education, # Total population with a bachelors degree
        zipcode_data.jan_avg_temp, # Daytime population of the zip
        zipcode_data.cost_of_living, # Average temperature in January
        zipcode_data.state, # Costs associated with owned dwellings
        # zipcode_data.latitude,
        # zipcode_data.longitude,
        # zipcode_data.state,
    ]

    results = db.session.query(*sel).filter(zipcode_data.state == "06").all()

    # Create a list for each variable
    incomes=[]
    crimes=[]
    educations=[]
    jan_avg_temps=[]
    cost_of_livings=[]

    # Loop through each result
    for result in results:
        # Create primaryzip code key
        incomes.append(result[1])
        crimes.append(result[2])
        educations.append(result[3])
        jan_avg_temps.append(result[4])
        cost_of_livings.append(result[5])

    avgs={
        'income':sum(incomes)/len(incomes),
        'crime':sum(crimes)/len(crimes),
        'education':sum(educations)/len(educations),
        'jan_avg_temp':sum(jan_avg_temps)/len(jan_avg_temps),
        'cost_of_living':sum(cost_of_livings)/len(cost_of_livings)
    }
        
    return jsonify(avgs)

@app.route("/zipcodes/<zipcode>")
def zipcode_info(zipcode):
    """Return the full data set for a given zipcode."""
    sel = [
        zipcode_data.zipcode,
        zipcode_data.income, # Average invidiual income
        zipcode_data.crime, # Total crime - 100 = average
        zipcode_data.education, # Total population with a bachelors degree
        zipcode_data.jan_avg_temp, # Daytime population of the zip
        zipcode_data.cost_of_living, # Average temperature in January
        zipcode_data.state, # Costs associated with owned dwellings
        zipcode_data.name,
        zipcode_data.city500_closest_name,
        # zipcode_data.latitude,
        # zipcode_data.longitude,
        # zipcode_data.state,
    ]
    

    results = db.session.query(*sel).filter(zipcode_data.zipcode == str(zipcode)).all()

    zip_data={}
    # Loop through results and create dataframe
    for result in results:
        zip_data['zipcode']=result[0]
        zip_data['income']=result[1]
        zip_data['crime']=result[2]
        zip_data['education']=result[3]
        zip_data['jan_avg_temp']=result[4]
        zip_data['cost_of_living']=result[5]
        zip_data['name']=result[7]
        zip_data['city500_closest_name']=result[8]

    # Return sorted zipcodes
    return(jsonify(zip_data))

if __name__ == "__main__":
    app.run()
