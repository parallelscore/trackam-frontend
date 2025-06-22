/**
 * Security Dashboard Component
 * Development/debugging component for monitoring security status
 */

import React, { useState } from 'react';
import { useSecurity } from '@/hooks/useSecurity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SecurityDashboard: React.FC = () => {
  const {
    isInitialized,
    isLoading,
    stats,
    report,
    riskLevel,
    refreshStats,
    reportThreat,
    setLearningEnabled,
    resetBehaviorProfile,
    error
  } = useSecurity();

  const [learningEnabled, setLearningEnabledState] = useState(true);

  const handleToggleLearning = () => {
    const newState = !learningEnabled;
    setLearningEnabled(newState);
    setLearningEnabledState(newState);
  };

  const handleTestThreat = (type: string) => {
    reportThreat(type, {
      source: 'security_dashboard_test',
      timestamp: Date.now(),
      userTriggered: true
    }, 60);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'default';
    }
  };

  if (!isInitialized && !isLoading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Security Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTitle>Security Monitoring Not Initialized</AlertTitle>
            <AlertDescription>
              Security monitoring is not currently active. Check configuration settings.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Security Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading security data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>Security Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={refreshStats} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Security Dashboard</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant={getRiskColor(riskLevel)}>
              {riskLevel.toUpperCase()} RISK
            </Badge>
            <Button onClick={refreshStats} size="sm">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {report && (
            <Alert className="mb-4">
              <AlertTitle>Security Summary</AlertTitle>
              <AlertDescription>{report.summary}</AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-center">
                  {stats?.totalEvents || 0}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Total Events
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-center">
                  {stats?.activeMonitors.length || 0}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Active Monitors
                </div>
                <div className="text-xs text-center mt-1">
                  {stats?.activeMonitors.join(', ') || 'None'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-center">
                  {stats?.eventsBySeverity.critical || 0}
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Critical Events
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="controls">Controls</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Events by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats && Object.entries(stats.eventsByType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{type.replace(/_/g, ' ')}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                  {!stats || Object.keys(stats.eventsByType).length === 0 && (
                    <div className="text-sm text-muted-foreground">No events recorded</div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Events by Severity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats && Object.entries(stats.eventsBySeverity).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{severity}</span>
                      <Badge variant={getRiskColor(severity)}>{count}</Badge>
                    </div>
                  ))}
                  {!stats || Object.keys(stats.eventsBySeverity).length === 0 && (
                    <div className="text-sm text-muted-foreground">No events recorded</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Real-time security event monitoring is active. Events are logged and analyzed
                by the smart monitoring system with adaptive thresholds.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {report?.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Controls</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Adaptive Learning</span>
                  <Button
                    onClick={handleToggleLearning}
                    variant={learningEnabled ? "default" : "outline"}
                    size="sm"
                  >
                    {learningEnabled ? 'Enabled' : 'Disabled'}
                  </Button>
                </div>
                
                <div className="pt-2">
                  <Button
                    onClick={resetBehaviorProfile}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Reset Behavior Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Test Threats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => handleTestThreat('suspicious_activity')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Test Suspicious Activity
                </Button>
                
                <Button
                  onClick={() => handleTestThreat('automation_detected')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Test Automation Detection
                </Button>
                
                <Button
                  onClick={() => handleTestThreat('behavioral_anomaly')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Test Behavioral Anomaly
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;