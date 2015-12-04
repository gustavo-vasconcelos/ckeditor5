/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

let toRestore;
const git = require( '../tasks/utils/git' );
const chai = require( 'chai' );
const sinon = require( 'sinon' );
const tools = require( '../tasks/utils/tools' );
const expect = chai.expect;

describe( 'utils', () => {
	beforeEach( () => toRestore = [] );

	afterEach( () => {
		toRestore.forEach( item => item.restore() );
	} );

	describe( 'git', () => {
		describe( 'parseRepositoryUrl', () => {
			it( 'should be defined', () => expect( git.parseRepositoryUrl ).to.be.a( 'function' ) );

			it( 'should parse short GitHub URL ', () => {
				const urlInfo = git.parseRepositoryUrl( 'ckeditor/ckeditor5-core' );

				expect( urlInfo.server ).to.equal( 'https://github.com/' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core' );
				expect( urlInfo.user ).to.equal( 'ckeditor' );
				expect( urlInfo.name ).to.equal( 'ckeditor5-core' );
				expect( urlInfo.branch ).to.equal( 'master' );
			} );

			it( 'should parse short GitHub URL with provided branch ', () => {
				const urlInfo = git.parseRepositoryUrl( 'ckeditor/ckeditor5-core#experimental' );

				expect( urlInfo.server ).to.equal( 'https://github.com/' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core' );
				expect( urlInfo.user ).to.equal( 'ckeditor' );
				expect( urlInfo.name ).to.equal( 'ckeditor5-core' );
				expect( urlInfo.branch ).to.equal( 'experimental' );
			} );

			it( 'should parse full GitHub URL (http)', () => {
				const urlInfo = git.parseRepositoryUrl( 'http://github.com/ckeditor/ckeditor5-core.git' );

				expect( urlInfo.server ).to.equal( 'http://github.com/' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core.git' );
				expect( urlInfo.user ).to.equal( 'ckeditor' );
				expect( urlInfo.name ).to.equal( 'ckeditor5-core' );
				expect( urlInfo.branch ).to.equal( 'master' );
			} );

			it( 'should parse full GitHub URL (http) with provided branch', () => {
				const urlInfo = git.parseRepositoryUrl( 'http://github.com/ckeditor/ckeditor5-core.git#experimental' );

				expect( urlInfo.server ).to.equal( 'http://github.com/' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core.git' );
				expect( urlInfo.user ).to.equal( 'ckeditor' );
				expect( urlInfo.name ).to.equal( 'ckeditor5-core' );
				expect( urlInfo.branch ).to.equal( 'experimental' );
			} );

			it( 'should parse full GitHub URL (https)', () => {
				const urlInfo = git.parseRepositoryUrl( 'https://github.com/ckeditor/ckeditor5-core.git' );

				expect( urlInfo.server ).to.equal( 'https://github.com/' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core.git' );
				expect( urlInfo.user ).to.equal( 'ckeditor' );
				expect( urlInfo.name ).to.equal( 'ckeditor5-core' );
				expect( urlInfo.branch ).to.equal( 'master' );
			} );

			it( 'should parse full GitHub URL (https) with provided branch', () => {
				const urlInfo = git.parseRepositoryUrl( 'https://github.com/ckeditor/ckeditor5-core.git#t/122' );

				expect( urlInfo.server ).to.equal( 'https://github.com/' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core.git' );
				expect( urlInfo.user ).to.equal( 'ckeditor' );
				expect( urlInfo.name ).to.equal( 'ckeditor5-core' );
				expect( urlInfo.branch ).to.equal( 't/122' );
			} );

			it( 'should parse full GitHub URL (git)', () => {
				const urlInfo = git.parseRepositoryUrl( 'git@github.com:ckeditor/ckeditor5-core.git' );

				expect( urlInfo.server ).to.equal( 'git@github.com:' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core.git' );
				expect( urlInfo.user ).to.equal( 'ckeditor' );
				expect( urlInfo.name ).to.equal( 'ckeditor5-core' );
				expect( urlInfo.branch ).to.equal( 'master' );
			} );

			it( 'should parse full GitHub URL (git)', () => {
				const urlInfo = git.parseRepositoryUrl( 'git://github.com/ckeditor/ckeditor5-core.git' );

				expect( urlInfo.server ).to.equal( 'git://github.com/' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core.git' );
				expect( urlInfo.user ).to.equal( 'ckeditor' );
				expect( urlInfo.name ).to.equal( 'ckeditor5-core' );
				expect( urlInfo.branch ).to.equal( 'master' );
			} );

			it( 'should parse full GitHub URL (git) with provided branch', () => {
				const urlInfo = git.parseRepositoryUrl( 'git@github.com:ckeditor/ckeditor5-core.git#new-feature' );

				expect( urlInfo.server ).to.equal( 'git@github.com:' );
				expect( urlInfo.repository ).to.equal( 'ckeditor/ckeditor5-core.git' );
				expect( urlInfo.user ).to.equal( 'ckeditor' );
				expect( urlInfo.name ).to.equal( 'ckeditor5-core' );
				expect( urlInfo.branch ).to.equal( 'new-feature' );
			} );

			it( 'should return null if GitHub URL is not valid', () => {
				let urlInfo = git.parseRepositoryUrl( 'https://ckeditor.com' );
				expect( urlInfo ).to.equal( null );

				urlInfo = git.parseRepositoryUrl( 'https://github.com/info.html' );
				expect( urlInfo ).to.equal( null );
			} );
		} );

		describe( 'cloneRepository', () => {
			it( 'should be defined', () => expect( git.cloneRepository ).to.be.a( 'function' ) );

			it( 'should call clone commands', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const workspacePath = '/path/to/workspace/';
				const urlInfo = git.parseRepositoryUrl( 'git@github.com:ckeditor/ckeditor5-core#new-feature' );
				const cloneCommands = `cd ${ workspacePath } && git clone ${ urlInfo.server + urlInfo.repository }`;
				toRestore.push( shExecStub );

				git.cloneRepository( urlInfo, workspacePath );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( cloneCommands );
			} );
		} );

		describe( 'checkout', () => {
			it( 'should be defined', () => expect( git.checkout ).to.be.a( 'function' ) );

			it( 'should call checkout commands', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const repositoryLocation = 'path/to/repository';
				const branchName = 'branch-to-checkout';
				const checkoutCommands = `cd ${ repositoryLocation } && git checkout ${ branchName }`;
				toRestore.push( shExecStub );

				git.checkout( repositoryLocation, branchName );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( checkoutCommands );
			} );
		} );

		describe( 'pull', () => {
			it( 'should be defined', () => expect( git.pull ).to.be.a( 'function' ) );
			it( 'should call pull commands', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const repositoryLocation = 'path/to/repository';
				const branchName = 'branch-to-pull';
				const pullCommands = `cd ${ repositoryLocation } && git pull origin ${ branchName }`;
				toRestore.push( shExecStub );

				git.pull( repositoryLocation, branchName );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( pullCommands );
			} );
		} );

		describe( 'initializeRepository', () => {
			it( 'should be defined', () => expect( git.initializeRepository ).to.be.a( 'function' ) );
			it( 'should call initialize commands', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const repositoryLocation = 'path/to/repository';
				const initializeCommands = [
					`git init ${ repositoryLocation }`,
					`cd ${ repositoryLocation }`,
					`git remote add boilerplate ${ git.BOILERPLATE_REPOSITORY }`,
					`git fetch boilerplate ${ git.BOILERPLATE_BRANCH }`,
					`git merge boilerplate/${ git.BOILERPLATE_BRANCH }`
				];
				toRestore.push( shExecStub );

				git.initializeRepository( repositoryLocation );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( initializeCommands.join( ' && ' ) );
			} );
		} );

		describe( 'getStatus', () => {
			it( 'should be defined', () => expect( git.getStatus ).to.be.a( 'function' ) );
			it( 'should call status command', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const repositoryLocation = 'path/to/repository';
				const statusCommands = `cd ${ repositoryLocation } && git status --porcelain -sb`;
				toRestore.push( shExecStub );

				git.getStatus( repositoryLocation );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( statusCommands );
			} );
		} );

		describe( 'updateBoilerplate', () => {
			it( 'should be defined', () => expect( git.updateBoilerplate ).to.be.a( 'function' ) );
			it( 'should fetch and merge boilerplate if remote already exists', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const repositoryLocation = 'path/to/repository';
				const updateCommands = [
					`cd ${ repositoryLocation }`,
					`git fetch boilerplate ${ git.BOILERPLATE_BRANCH }`,
					`git merge boilerplate/${ git.BOILERPLATE_BRANCH }`
				];
				shExecStub.onCall( 0 ).returns( 'origin\nboilerplate' );
				toRestore.push( shExecStub );

				git.updateBoilerplate( repositoryLocation );

				expect( shExecStub.calledTwice ).to.equal( true );
				expect( shExecStub.secondCall.args[ 0 ] ).to.equal( updateCommands.join( ' && ' ) );
			} );

			it( 'should add boilerplate remote if one not exists', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const repositoryLocation = 'path/to/repository';
				const addRemoteCommands = `cd ${ repositoryLocation } && git remote add boilerplate ${ git.BOILERPLATE_REPOSITORY }`;
				const updateCommands = [
					`cd ${ repositoryLocation }`,
					`git fetch boilerplate ${ git.BOILERPLATE_BRANCH }`,
					`git merge boilerplate/${ git.BOILERPLATE_BRANCH }`
				];
				shExecStub.onCall( 0 ).returns( 'origin\nnew' );
				toRestore.push( shExecStub );

				git.updateBoilerplate( repositoryLocation );

				expect( shExecStub.calledThrice ).to.equal( true );
				expect( shExecStub.secondCall.args[ 0 ] ).to.equal( addRemoteCommands );
				expect( shExecStub.thirdCall.args[ 0 ] ).to.equal( updateCommands.join( ' && ' )  );
			} );
		} );

		describe( 'initialCommit', () => {
			it( 'should be defined', () => expect( git.initialCommit ).to.be.a( 'function' ) );
			it( 'should execute commit commands', () => {
				const shExecStub = sinon.stub( tools, 'shExec' );
				const pluginName = 'ckeditor5-plugin-name';
				const repositoryPath = '/path/to/repo';
				const commitCommands = [
					`cd ${ repositoryPath }`,
					`git add .`,
					`git commit -m "Initial commit for ${ pluginName }."`
				];
				toRestore.push( shExecStub );

				git.initialCommit( pluginName, repositoryPath );

				expect( shExecStub.calledOnce ).to.equal( true );
				expect( shExecStub.firstCall.args[ 0 ] ).to.equal( commitCommands.join( ' && ' ) );
			} );
		} );
	} );
} );
