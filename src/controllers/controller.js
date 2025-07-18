import axios from 'axios';
// const { HttpsProxyAgent } = require('https-proxy-agent');

// const proxy = process.env.PROXY;

// const proxyAgent = new HttpsProxyAgent(process.env.PROXY);

export const getRouting = async (req, res) => {
  const { lat1, lon1, lat2, lon2 } = req.query;
  const url = `https://bhuvan-app1.nrsc.gov.in/api/routing/curl_routing_state.php?lat1=${lat1}&lon1=${lon1}&lat2=${lat2}&lon2=${lon2}&token=${process.env.ROUTE_TOKEN}`;

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // httpsAgent: proxyAgent,
      // proxy: false,
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.statusText,
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const getThematicData = async (req, res) => {
  const { lat, lon, year } = req.query;
  const url = `https://bhuvan-app1.nrsc.gov.in/api/lulc250k/curl_lulc250k_point.php?lat=${lat}&lon=${lon}&year=${year}&token=${process.env.THEMATIC_TOKEN}`;

  try {
    const response = await axios.get(url, {
      timeout: 100000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.statusText,
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const villageGeocoding = async (req, res) => {
  const { village } = req.query;
  const url = `https://bhuvan-app1.nrsc.gov.in/api/api_proximity/curl_village_geocode.php?village=${village}&token=${process.env.VG_TOKEN}`;

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.statusText,
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

export const getEllipsoid = async (req, res) => {
  const { id } = req.query;
  const url = `https://bhuvan-app1.nrsc.gov.in/api/geoid/curl_gdal_api.php?id=${id}&datum=elipsoid&se=CDEM&key=${process.env.GEOID_TOKEN}`;

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      timeout: 10000,
      headers: {
        'Content-Type': 'application/zip',
        'Contend-Deposition': 'attachment',
      },
    });
    response.data.pipe(res);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({
        error: error.response.statusText,
        details: error.response.data,
      });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};