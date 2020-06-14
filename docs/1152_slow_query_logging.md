# Slow query logging

Our Cloud SQL instance logs to a bucket, which the `/cron/export_slow_query_log` job wrangles and exports to BigQuery. The resulting table can be summarized like this:

```
SELECT 
  sql_text,
  COUNT(sql_text) as count,
  MAX(query_duration_ms) as max,
  MIN(query_duration_ms) as min,
  ROUND(AVG(query_duration_ms), 3) as avg
FROM `tritonplatform.triton_logs.slow_log`
GROUP BY sql_text
ORDER BY AVG(query_duration_ms) DESC
```
