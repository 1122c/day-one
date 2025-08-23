import React from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { FiArrowRight, FiZap, FiShield, FiStar, FiUsers, FiMessageSquare, FiTarget, FiHeart } from 'react-icons/fi';
import Layout from '@/components/Layout';

export default function Home() {
  const [user, loading] = useAuthState(auth);

  // If still loading auth state, show loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // If user is authenticated, show dashboard
  if (user) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user.displayName || user.email}!
                </h1>
                <p className="mt-1 text-gray-600">
                  Here's what's happening with your connections today.
                </p>
              </div>
              <div className="flex space-x-4">
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                  Update Profile
                </button>
                <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100">
                  View Activity
                </button>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <FiUsers className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Connections</p>
                  <p className="text-lg font-semibold text-gray-900">12</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FiMessageSquare className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Chats</p>
                  <p className="text-lg font-semibold text-gray-900">5</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FiTarget className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Goals Achieved</p>
                  <p className="text-lg font-semibold text-gray-900">3</p>
                </div>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                  <FiHeart className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Match Score</p>
                  <p className="text-lg font-semibold text-gray-900">85%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/discover"
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 flex items-center justify-center"
                >
                  Find New Connections
                </Link>
                <button className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100">
                  Update Preferences
                </button>
                <button className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100">
                  View Activity Log
                </button>
              </div>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FiHeart className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">New match found!</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FiMessageSquare className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Message received</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="text-3xl font-extrabold text-indigo-600 tracking-tight">
                ConnectMind
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-8">
              Connect with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Purpose</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Build meaningful connections based on shared values, goals, and authentic interests. 
              ConnectMind uses AI-powered matching to help you find people who truly align with your vision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Start Your Journey
                <FiArrowRight className="inline ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/discover"
                className="px-8 py-4 text-lg font-medium text-indigo-600 bg-white border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all duration-200 shadow-lg"
              >
                Explore Connections
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-indigo-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose ConnectMind?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform goes beyond surface-level connections to create meaningful relationships 
              that support your personal and professional growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiZap className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Matching</h3>
              <p className="text-gray-600">
                Advanced algorithms analyze your values, goals, and communication preferences 
                to find the most compatible connections.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiShield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Authentic Connections</h3>
              <p className="text-gray-600">
                Focus on building genuine relationships based on shared values and mutual 
                support rather than superficial interactions.
              </p>
            </div>
            
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiStar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Growth-Focused</h3>
              <p className="text-gray-600">
                Connect with people who inspire you, challenge you, and help you achieve 
                your personal and professional goals.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10K+</div>
              <div className="text-indigo-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">5K+</div>
              <div className="text-indigo-100">Successful Matches</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-indigo-100">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">24/7</div>
              <div className="text-indigo-100">AI Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Build Meaningful Connections?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of people who are already connecting with purpose and building 
            relationships that matter.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
          >
            Get Started Today
            <FiArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400 mb-4">ConnectMind</div>
            <p className="text-gray-400 mb-6">
              Building meaningful connections, one match at a time.
            </p>
            <div className="text-sm text-gray-500">
              © 2024 ConnectMind. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
